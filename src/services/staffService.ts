import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { logAuditEvent } from "./auditService";

// Secondary client specifically for creating accounts without messing up the current admin session
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't save session to local storage
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Creates a mechanic account directly and securely.
 * Uses a secondary Supabase client to avoid overwriting the Admin's active session.
 */
export const createMechanicAccount = async (
  name: string,
  email: string,
  password: string,
  ownerId: string
): Promise<boolean> => {
  try {
    // 1. Create auth user with secondary client
    const { data: authData, error: authError } = await authClient.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    // 2. Create the user profile in the database via the main client (Admin authenticated)
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      name,
      role: "mechanic",
      shop_id: "a0000000-0000-0000-0000-000000000001", // Demo shop ID
    });

    // PGRST116 and 23505 are duplicate/existing row errors
    if (profileError && profileError.code !== "PGRST116" && profileError.code !== "23505") {
      throw profileError;
    }

    await logAuditEvent(
      ownerId,
      "create_mechanic",
      `Directly created mechanic account for ${email}`
    );

    return true;
  } catch (err) {
    console.error("❌ Mechanic creation failed:", err);
    throw err;
  }
};

/**
 * Get all mechanics for managing staff.
 */
export const getMechanics = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "mechanic")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching mechanics:", error);
    return [];
  }
  return data;
};
