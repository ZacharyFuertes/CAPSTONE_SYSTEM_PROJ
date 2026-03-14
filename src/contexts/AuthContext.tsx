import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "../types";
import { supabase } from "../services/supabaseClient";
import { formatDatabaseError } from "../services/dbHelper";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  // RBAC permission methods
  canManageInventory: () => boolean;
  canViewInventory: () => boolean;
  canManageAppointments: () => boolean;
  canViewOwnAppointments: () => boolean;
  canManageUsers: () => boolean;
  canViewReports: () => boolean;
  canAccessAdminDashboard: () => boolean;
  canRecordServiceProgress: () => boolean;
  canAccessCustomerPortal: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    // Restore user from localStorage on initial load
    const savedUser = localStorage.getItem("cachedUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener - don't use retry logic here, keep it simple
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      try {
        if (session?.user) {
          // Fetch user profile from database - simple, no retry
          const { data: userData, error: selectError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          // If user not found in database, create a minimal record
          if (selectError?.code === "PGRST116" || !userData) {
            console.log(
              "User record not found, creating default user record...",
            );
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({
                id: session.user.id,
                email: session.user.email || "unknown",
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split("@")[0] ||
                  "User",
                role: "customer",
              })
              .select()
              .single();

            if (!insertError && newUser) {
              if (isMounted) {
                setUser(newUser);
                localStorage.setItem("cachedUser", JSON.stringify(newUser));
              }
            }
          } else if (isMounted && userData) {
            setUser(userData);
            // Cache user in localStorage for page reloads
            localStorage.setItem("cachedUser", JSON.stringify(userData));
          }
        } else {
          if (isMounted) setUser(null);
          localStorage.removeItem("cachedUser");
        }
      } catch (err) {
        console.error("Error updating user on auth state change:", err);
        // Don't break auth flow - just log the error
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sign in with auth
      const {
        data: { user: authUser },
        error: signInError,
      } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (authUser?.id) {
        // Fetch user data
        let { data: userData, error: selectError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        // If user not found in database, create a minimal record
        if (selectError?.code === "PGRST116" || !userData) {
          console.log("User record not found in database, creating one...");
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email || email,
              name: authUser.user_metadata?.name || email.split("@")[0],
              role: "customer",
            })
            .select()
            .single();

          if (insertError) {
            console.error("Failed to create user record:", insertError);
            throw new Error(
              "Account created but profile setup failed. Please contact support.",
            );
          }

          userData = newUser;
        }

        if (userData) {
          setUser(userData);
          localStorage.setItem("cachedUser", JSON.stringify(userData));
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      throw new Error(formatDatabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("🔴 Logout initiated");
    try {
      console.log("🔴 Calling supabase.auth.signOut()");

      // Add timeout detection
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("signOut timed out after 5s")), 5000),
      );

      await Promise.race([signOutPromise, timeoutPromise]);

      console.log("🔴 signOut successful");
      setUser(null);
      console.log("🔴 User state cleared");
      // Clear all cached user data from localStorage
      localStorage.removeItem("cachedUser");
      localStorage.removeItem("lastVisitedPage");
      console.log("🔴 localStorage cleared");
    } catch (error) {
      console.error("🔴 Logout error:", error);
      console.error("🔴 Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        type: typeof error,
      });
      // Even if signOut fails, still clear local state and cache
      setUser(null);
      localStorage.removeItem("cachedUser");
      localStorage.removeItem("lastVisitedPage");
      console.log("🔴 Cache cleared after error");
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        { email, password },
      );

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        if (signUpError.message.includes("already registered")) {
          throw new Error(
            "This email is already registered. Please login instead or use a different email.",
          );
        }
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error("User creation failed - no user returned");
      }

      console.log("Auth user created:", authData.user.id);

      // Check if user profile already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      let userData = existingUser;

      if (checkError?.code === "PGRST116" || !existingUser) {
        // User doesn't exist, create them
        // Generate a proper UUID for shop_id
        const generateUUID = () => {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            },
          );
        };

        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            email,
            name,
            role,
            shop_id: role === "customer" ? null : generateUUID(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Users table insert error:", insertError);
          throw new Error(
            `Failed to create user profile: ${insertError.message}`,
          );
        }

        userData = insertData;
      } else if (existingUser) {
        // User exists, update their role if different
        if (existingUser.role !== role) {
          const { data: updateData, error: updateError } = await supabase
            .from("users")
            .update({ role, name })
            .eq("id", authData.user.id)
            .select()
            .single();

          if (updateError) {
            console.error("Users table update error:", updateError);
            throw new Error(
              `Failed to update user profile: ${updateError.message}`,
            );
          }

          userData = updateData;
        }
      }

      console.log("User profile ready:", userData);

      // Create app user object
      const appUser: User = {
        id: authData.user.id,
        email,
        name,
        role,
        shop_id: role === "customer" ? undefined : userData?.shop_id,
      };

      setUser(appUser);
      localStorage.setItem("cachedUser", JSON.stringify(appUser));
    } catch (error) {
      console.error("Full signup error:", error);
      throw new Error(formatDatabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // RBAC Permission Methods based on capstone requirements
  const canManageInventory = (): boolean => user?.role === "owner";
  const canViewInventory = (): boolean =>
    user?.role === "owner" || user?.role === "mechanic";
  const canManageAppointments = (): boolean => user?.role === "owner";
  const canViewOwnAppointments = (): boolean =>
    user?.role === "mechanic" || user?.role === "customer";
  const canManageUsers = (): boolean => user?.role === "owner";
  const canViewReports = (): boolean => user?.role === "owner";
  const canAccessAdminDashboard = (): boolean =>
    user?.role === "owner" || user?.role === "mechanic";
  const canRecordServiceProgress = (): boolean => user?.role === "mechanic";
  const canAccessCustomerPortal = (): boolean => user?.role === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
        hasRole,
        canManageInventory,
        canViewInventory,
        canManageAppointments,
        canViewOwnAppointments,
        canManageUsers,
        canViewReports,
        canAccessAdminDashboard,
        canRecordServiceProgress,
        canAccessCustomerPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
