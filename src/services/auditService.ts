import { supabase } from "./supabaseClient";
// Audit service for tracking events

/**
 * Log an audit event to the database.
 * Used for tracking sensitive changes like role assignments, invitations, etc.
 * 
 * @param userId - The ID of the user performing the action (optional, falls back to auth user)
 * @param action - A string describing the action (e.g., 'created_invitation')
 * @param details - Optional JSON string with additional details about the action
 */
export const logAuditEvent = async (
  userId: string | null = null,
  action: string,
  details?: string
): Promise<void> => {
  try {
    // If no userId provided, try to get the current authenticated user
    let actorId = userId;
    if (!actorId) {
      const { data: { session } } = await supabase.auth.getSession();
      actorId = session?.user?.id || null;
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: actorId,
      action: action,
      details: details || null,
    });

    if (error) {
      console.error("❌ Failed to write audit log:", error);
    }
  } catch (err) {
    console.error("❌ Exception while writing audit log:", err);
  }
};
