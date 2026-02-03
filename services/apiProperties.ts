
import { supabase, supabaseUrl } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Property, PropertyInsert } from "../types";

export async function getProperties({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
  let query = supabase
    .from("properties")
    .select("*, units(count)");

  // Filter
  if (filter) {
    if (filter.field && filter.value) {
        query = query.eq(filter.field, filter.value);
    }
  }

  // Sort
  if (sortBy) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Properties could not be loaded");
  }

  // Transformation: We now keep the DB shape but add 'occupancy'
  // We cast to any[] to avoid the deep join type recursion error, but map to strict strict Property type.
  const formattedData: Property[] = (data as any[]).map((p: any) => ({
      ...p,
      // Ensure specific fields if needed
      image_url: p.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
      // If total_units is present in DB, use it. Fallback to units count if total_units is 0 or null? 
      // DB schema says total_units is number (not nullable implied by generated type, but let's be safe)
      total_units: p.total_units ?? p.units?.[0]?.count ?? 0,
      occupancy: 0, 
  }));

  return { data: formattedData, count };
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, units(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Property not found");
  }

  const propertyData: any = data;

  // Calculate occupancy
  const unitIds = (propertyData.units || []).map((u: any) => u.id);
  let occupiedUnits = 0;
  if (unitIds.length > 0) {
      const { count } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .in('unit_id', unitIds)
        .eq('status', 'active');
      occupiedUnits = count || 0;
  }
  const totalUnits = propertyData.total_units || propertyData.units?.length || 0;
  const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const result: Property = {
    ...propertyData,
    total_units: totalUnits, // Update total_units if calculation logic differs, otherwise keep propertyData.total_units
    occupancy,
  };

  return result;
}

export async function createEditProperty(newProperty: any, id?: string) {
  const hasImagePath = typeof newProperty.image === 'string' && newProperty.image.startsWith(supabaseUrl);
  
  // We accept either a file object (new upload) or a string (existing url)
  // Input 'newProperty' might come from the form with keys like 'image' (UI) or 'image_url' (DB).
  // We should standardize input handling. Assuming UI now sends 'image_url' or 'image' file.
  
  let imagePath = newProperty.image_url || newProperty.image; 
  let imageName = '';

  // If it's a file object
  if (typeof newProperty.image === 'object' && newProperty.image !== null) {
      imageName = `${Math.random()}-${newProperty.image.name}`.replaceAll("/", "");
      imagePath = `${supabaseUrl}/storage/v1/object/public/property-images/${imageName}`;
  }

  // db column mapping
  const dbPayload: PropertyInsert = {
      name: newProperty.name,
      address: newProperty.address,
      type: newProperty.type, // expects 'commercial' | 'residential'
      total_units: parseInt(newProperty.total_units || newProperty.units),
      image_url: imagePath,
      organization_id: '00000000-0000-0000-0000-000000000000' // Placeholder/Context
  };
  
  // Use 'any' cast for payload to bypass organization_id check temporarily or if we assume strict check fails on missing org_id context
  // But since we provided specific Placeholders, it might pass strict type check if we match PropertyInsert.
  // PropertyInsert requires organization_id. 

  let query = supabase.from("properties");

  // Create
  if (!id) {
    query = query.insert([dbPayload as any]);
  }

  // Edit
  if (id) {
    query = query.update(dbPayload as any).eq("id", id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error("Property could not be saved");
  }

  // If it was a string URL (no new upload), we are done
  if (typeof newProperty.image === 'string') return data;

  // Upload image if needed
  if (imageName && typeof newProperty.image === 'object') {
      const { error: storageError } = await supabase.storage
        .from("property-images")
        .upload(imageName, newProperty.image);

      if (storageError) {
        await supabase.from("properties").delete().eq("id", data.id);
        console.error(storageError);
        throw new Error("Property image could not be uploaded and the property was not created");
      }
  }

  return data;
}

export async function deleteProperty(id: string) {
  const { data, error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Property could not be deleted");
  }

  return data;
}
