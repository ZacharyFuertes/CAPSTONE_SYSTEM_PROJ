import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { User, UserRole } from "../types";
import { supabase } from "../services/supabaseClient";
import { formatDatabaseError } from "../services/dbHelper";

/**
 * Auth Context Type
 * Provides session management and authentication methods
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
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

/**
 * AuthProvider - Manages authentication state and session persistence
 *
 * KEY FEATURES for fixing reload bug:
 * 1. On mount: calls supabase.auth.getSession() → restores persisted session from localStorage
 * 2. Subscribes to supabase.auth.onAuthStateChange() → syncs live auth changes
 * 3. Manages isLoading properly → loading=true until initial session check completes
 * 4. Fetches user profile from DB based on auth session
 * 5. Cleans up subscription on unmount
 *
 * This pattern ensures that:
 * - Browser refresh → getSession() restores session from localStorage → user stays logged in
 * - Login → auth state change fires → listener updates state
 * - Logout → auth state change fires → listener clears state
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<
    | ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"]
    | null
  >(null);

  /**
   * Fetch and set user profile from database
   * Creates profile if it doesn't exist
   */
  const setUserProfileFromSession = async (userId: string, email?: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userData) {
        console.log("✅ [Auth] User profile loaded from DB");
        setUser(userData as User);
        return;
      }

      // User doesn't exist in DB - create profile
      if (error?.code === "PGRST116") {
        console.log("📝 [Auth] Creating user profile");
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: email || "unknown",
            name: email?.split("@")[0] || "User",
            role: "customer",
          })
          .select()
          .single();

        if (newUser) {
          console.log("✅ [Auth] User profile created");
          setUser(newUser as User);
        }
      } else if (error) {
        console.error("❌ [Auth] Error fetching user profile:", error);
      }
    } catch (err) {
      console.error("❌ [Auth] Error setting user profile:", err);
    }
  };

  /**
   * FIXED: Single unified effect to handle auth state
   *
   * KEY FIX for race condition:
   * - Removed separate restoreSession() effect that called getSession()
   * - Supabase's onAuthStateChange automatically fires INITIAL_SESSION event on mount
   *   with the persisted session from localStorage
   * - This INITIAL_SESSION event replaces the need for manual getSession() call
   * - Single setIsLoading(false) call AFTER user profile is fetched, preventing race
   *
   * Before (BUGGY):
   *   1. restoreSession effect calls getSession() (async)
   *   2. onAuthStateChange listener fires INITIAL_SESSION immediately
   *   3. Both try to set isLoading=false, causing race condition
   *   4. UI sees logged-out state briefly before user profile loads
   *
   * After (FIXED):
   *   1. Only onAuthStateChange listener, which gets INITIAL_SESSION from Supabase
   *   2. Waits for setUserProfileFromSession() to complete (fetches user from DB)
   *   3. Only then calls setIsLoading(false) in finally block
   *   4. UI sees fully loaded user state, no flashing/redirects
   */
  useEffect(() => {
    let isMounted = true;

    console.log("📡 [Auth] Setting up auth state listener");

    // Subscribe to auth changes
    // Supabase automatically fires INITIAL_SESSION event on mount with persisted session
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("📡 [Auth] Auth event:", event, !!session?.user?.id);

      try {
        if (session?.user?.id) {
          // User is/remains logged in
          console.log("👤 [Auth] User session found:", session.user.id);
          // Wait for user profile to be fetched from DB before marking as loaded
          await setUserProfileFromSession(session.user.id, session.user.email);
        } else {
          // User is logged out or no session
          console.log("🚪 [Auth] No active session");
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("❌ [Auth] Error handling auth state change:", err);
      } finally {
        // Only set loading to false AFTER user profile has been fetched/cleared
        // This is the single point where loading state is finalized
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    subscriptionRef.current = data.subscription;

    return () => {
      // Clean up subscription on unmount
      isMounted = false;
      if (subscriptionRef.current) {
        console.log("🧹 [Auth] Cleaning up auth listener");
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("🔐 [Auth] Login attempt:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.user?.id) throw new Error("Login failed");

      console.log("✅ [Auth] Login successful");
      // Auth state listener will automatically fetch user profile and update state
    } catch (err) {
      console.error("❌ [Auth] Login error:", err);
      setIsLoading(false);
      throw new Error(formatDatabaseError(err));
    }
  };

  const logout = async () => {
    console.log("🚪 [Auth] Logout initiated");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("✅ [Auth] Logged out successfully");
      // Auth state listener will automatically clear user state
    } catch (err) {
      console.error("❌ [Auth] Logout error:", err);
      // Force clear state even if error occurs
      setUser(null);
      throw new Error(formatDatabaseError(err));
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    console.log("📝 [Auth] Signup attempt:", email, "role:", role);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.user?.id) throw new Error("Signup failed");

      // Create user profile in database
      const { data: newUser, error: profileError } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          email,
          name,
          role,
          shop_id:
            role === "customer"
              ? null
              : crypto.randomUUID?.() || Date.now().toString(),
        })
        .select()
        .single();

      if (profileError) throw profileError;

      console.log("✅ [Auth] Signup successful");
      if (newUser) {
        setUser(newUser as User);
      }
      // Auth state listener will also sync the session
    } catch (err) {
      console.error("❌ [Auth] Signup error:", err);
      setIsLoading(false);
      throw new Error(formatDatabaseError(err));
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // RBAC Permission Methods
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * Usage: const { user, isLoading, login, logout } = useAuth()
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
