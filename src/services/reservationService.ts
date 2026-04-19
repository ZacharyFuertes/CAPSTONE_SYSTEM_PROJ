/**
 * Reservation Service
 * TODO: implemented — Handles part reservations for customers
 *
 * Reservations table schema:
 *   id UUID PK, customer_id UUID FK->users, part_id UUID FK->parts,
 *   quantity INT, status VARCHAR, notes TEXT, created_at, updated_at
 */
import { supabase } from "./supabaseClient";

export interface Reservation {
  id: string;
  customer_id: string;
  part_id: string;
  quantity: number;
  status: "pending" | "confirmed" | "cancelled" | "fulfilled";
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  part?: { name: string; unit_price: number; image_url?: string; sku?: string };
  customer?: { name: string; email: string };
}

/**
 * Create a new reservation for a logged-in customer
 */
export async function createReservation(
  customerId: string,
  partId: string,
  quantity: number = 1,
  notes?: string
): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      customer_id: customerId,
      part_id: partId,
      quantity,
      status: "pending",
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("❌ Error creating reservation:", error);
    throw new Error(error.message);
  }

  return data as Reservation;
}

/**
 * Get all reservations for a specific customer
 */
export async function getCustomerReservations(
  customerId: string
): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(`*, part:parts(name, unit_price, image_url, sku)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching customer reservations:", error);
    return [];
  }

  return (data as Reservation[]) || [];
}

/**
 * Get all reservations (admin view) with customer and part info
 */
export async function getAllReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `*, part:parts(name, unit_price, image_url, sku), customer:users!customer_id(name, email)`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching all reservations:", error);
    return [];
  }

  return (data as Reservation[]) || [];
}

/**
 * Update reservation status (admin action)
 */
export async function updateReservationStatus(
  reservationId: string,
  status: Reservation["status"]
): Promise<boolean> {
  const { error } = await supabase
    .from("reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (error) {
    console.error("❌ Error updating reservation status:", error);
    return false;
  }

  return true;
}

/**
 * Get reservation count by status (for dashboard stats)
 */
export async function getReservationStats(): Promise<{
  pending: number;
  confirmed: number;
  fulfilled: number;
  total: number;
}> {
  const { data, error } = await supabase
    .from("reservations")
    .select("status");

  if (error) {
    console.error("❌ Error fetching reservation stats:", error);
    return { pending: 0, confirmed: 0, fulfilled: 0, total: 0 };
  }

  const stats = {
    pending: 0,
    confirmed: 0,
    fulfilled: 0,
    total: data?.length || 0,
  };

  data?.forEach((r: any) => {
    if (r.status === "pending") stats.pending++;
    else if (r.status === "confirmed") stats.confirmed++;
    else if (r.status === "fulfilled") stats.fulfilled++;
  });

  return stats;
}
