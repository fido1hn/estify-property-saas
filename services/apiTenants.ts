
import { supabase } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Tenant } from "../types";

export async function getTenants({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
  let query = supabase
    .from("tenants")
    .select(`
        id,
        user_id,
        unit_id,
        lease_end,
        status,
        created_at,
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

  const formattedData: Tenant[] = (data || []).map((t: any) => ({
      id: t.id, 
      name: t.profiles?.full_name || 'Unknown',
      email: t.profiles?.email || '',
      unitId: t.unit_id,
      propertyName: t.units?.properties?.name || 'Unassigned',
      leaseEnd: t.lease_end,
      status: (t.status === 'active' ? 'Active' : t.status === 'pending' ? 'Notice' : 'Delinquent') as any
  }));

  return { data: formattedData, count };
}

export async function getTenant(id: string) {
  const { data: t, error } = await supabase
    .from('tenants')
    .select(`
        id,
        user_id,
        unit_id,
        lease_end,
        status,
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

  const tenant: any = t;
  return {
    id: tenant.id,
    name: tenant.profiles?.full_name || 'Unknown',
    email: tenant.profiles?.email || '',
    unitId: tenant.unit_id,
    propertyName: tenant.units?.properties?.name || 'Unassigned',
    leaseEnd: tenant.lease_end,
    status: (tenant.status === 'active' ? 'Active' : tenant.status === 'pending' ? 'Notice' : 'Delinquent') as any
  };
}

// Update ONLY (Creation usually handles auth + profile + tenant record creation which is complex)
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
