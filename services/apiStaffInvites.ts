import { supabase } from "./supabaseClient";
import { Database } from "../types/database.types";

type InviteInsert = Database["public"]["Tables"]["staff_invites"]["Insert"];
type InviteRow = Database["public"]["Tables"]["staff_invites"]["Row"];

export async function createStaffInvite(payload: InviteInsert) {
  const { data, error } = await supabase
    .from("staff_invites")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Invite could not be created");
  }

  return data as InviteRow;
}
