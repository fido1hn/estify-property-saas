import { supabase } from "./supabaseClient";
import { Database } from "../types";

type UnitRow = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
type UnitUpdate = Database["public"]["Tables"]["units"]["Update"];

export async function getUnitsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", propertyId)
    .order("unit_number", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Units could not be loaded");
  }

  return (data as UnitRow[]) || [];
}

export async function createUnit(payload: UnitInsert) {
  const { data, error } = await supabase
    .from("units")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Unit could not be created");
  }

  return data as UnitRow;
}

export async function updateUnit(id: string, updates: UnitUpdate) {
  const { data, error } = await supabase
    .from("units")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Unit could not be updated");
  }

  return data as UnitRow;
}

export async function deleteUnit(id: string) {
  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unit could not be deleted");
  }
}
