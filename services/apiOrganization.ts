
import { supabase } from "./supabaseClient";

export async function getOrganization() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Organization could not be loaded");
  }
  
  return data;
}

export async function updateOrganization(updates: any) {
  // We don't need to pass an ID if we rely on RLS, but usually it's safer to pass it.
  // However, since we might not have the ID handy in the UI without fetching it first,
  // we can also rely on the fact that RLS restricts us to one organization.
  // But typically update requires an ID or a filter.
  // Let's assume the UI passes the ID (or we fetch it first).
  // Actually, for a single setting/org, we can fetch the user's org ID first or expect it in arguments.
  
  // Strategy: Expect the ID to be passed, mirroring how typical mutations work.
  // If the user wants to update "current organization", they likely loaded it first.
  
  if (!updates.id) {
       // If no ID provided, try to find the single visible organization (safe due to RLS)
       const { data: org } = await supabase.from("organizations").select("id").single();
       if (org) {
           updates.id = org.id;
       } else {
           throw new Error("No organization found to update");
       }
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", updates.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Organization could not be updated");
  }
  return data;
}
