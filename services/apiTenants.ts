
import { supabase } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Tenant } from "../types";

export async function getTenants({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
  let query = supabase
    .from("tenants")
    .select(`
        *,
        profiles:user_id (full_name, email),
        units:unit_id (
            properties:property_id (name)
        )
    `, { count: 'exact' });

  if (filter) {
     if (filter.field && filter.value) query = query.eq(filter.field, filter.value);
  }

  if (sortBy) {
    query = query.order(sortBy.field, { ascending: sortBy.direction === "asc" });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Tenants could not be loaded");
  }

  // Cast data to any[] to avoid excessive type instantiation depth with the deep joins
  const formattedData: Tenant[] = (data as any[] || []).map((t: any) => ({
      ...t
      // We pass the raw structure which matches the Tenant type defined in types/index.ts
  }));

  return { data: formattedData, count };
}

export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select(`
        *,
        profiles:user_id (full_name, email),
        units:unit_id (
            properties:property_id (name)
        )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
      console.error(error);
      throw new Error("Tenant not found");
  }

  return data as any as Tenant;
}

// Update ONLY
export async function updateTenant(id: string, updates: any) {
    const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw new Error("Tenant could not be updated");
    return data;
}
