
import { supabase } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Tenant } from "../types";

type UnitLookup = {
  id: string;
  unit_number: number;
  properties?: { name: string | null } | null;
};

export async function getTenants({
  filter,
  sortBy,
  page,
}: { filter?: any; sortBy?: any; page?: number } = {}) {
  let query: any = supabase
    .from("tenants")
    .select(
      `
        *,
        profiles:id (full_name, email, phone_number)
    `,
      { count: "exact" },
    );

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

  const tenants = (data as Tenant[]) || [];
  const tenantIds = tenants.map((t) => t.id).filter(Boolean);

  let activeUnitByTenant: Record<
    string,
    { id: string; unit_number: number; property_name?: string | null } | null
  > = {};

  if (tenantIds.length > 0) {
    const { data: occupants } = await supabase
      .from("unit_occupants")
      .select("tenant_id, unit_id")
      .in("tenant_id", tenantIds)
      .is("left_at", null);

    const unitIds = Array.from(
      new Set((occupants || []).map((o) => o.unit_id).filter(Boolean)),
    );

    let unitsById: Record<string, UnitLookup> = {};
    if (unitIds.length > 0) {
      const { data: unitsData } = await supabase
        .from("units")
        .select("id, unit_number, properties:property_id (name)")
        .in("id", unitIds);

      unitsById = (unitsData as UnitLookup[] || []).reduce((acc, unit) => {
        acc[unit.id] = unit;
        return acc;
      }, {} as Record<string, UnitLookup>);
    }

    for (const occ of occupants || []) {
      if (!activeUnitByTenant[occ.tenant_id]) {
        const unit = unitsById[occ.unit_id];
        activeUnitByTenant[occ.tenant_id] = unit
          ? {
              id: unit.id,
              unit_number: unit.unit_number,
              property_name: unit.properties?.name ?? null,
            }
          : null;
      }
    }
  }

  const formattedData: Tenant[] = tenants.map((t) => ({
    ...t,
    active_unit: activeUnitByTenant[t.id] || null,
  }));

  return { data: formattedData, count };
}

export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from("tenants")
    .select(
      `
        *,
        profiles:id (full_name, email, phone_number)
      `,
    )
    .eq("id", id)
    .single();
  
  if (error) {
      console.error(error);
      throw new Error("Tenant not found");
  }

  const tenant = data as Tenant;

  const { data: occupants } = await supabase
    .from("unit_occupants")
    .select("tenant_id, unit_id")
    .eq("tenant_id", id)
    .is("left_at", null);

  const unitId = occupants?.[0]?.unit_id;
  if (!unitId) {
    return { ...tenant, active_unit: null };
  }

  const { data: unitData } = await supabase
    .from("units")
    .select("id, unit_number, properties:property_id (name)")
    .eq("id", unitId)
    .single();

  const unit = unitData as UnitLookup | null;
  return {
    ...tenant,
    active_unit: unit
      ? {
          id: unit.id,
          unit_number: unit.unit_number,
          property_name: unit.properties?.name ?? null,
        }
      : null,
  };
}

// Update ONLY
export async function updateTenant(id: string, updates: any) {
    let query: any = supabase.from('tenants');
    query = query.update(updates).eq('id', id).select().single();
    const { data, error } = await query;
    
    if (error) throw new Error("Tenant could not be updated");
    return data;
}

export async function deleteTenant(id: string) {
    let query: any = supabase.from('tenants');
    query = query.delete().eq('id', id);
    const { error } = await query;
    if (error) throw new Error("Could not delete tenant");
}
