
import { supabase, supabaseUrl } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Property } from "../types";

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

  // Transformation to match UI expectation if needed
  // dbService mapped `total_units` or counted units.
  // We will pass the raw data mostly, but we might need to adapt the shape 
  // to match the `Property` interface if the strict typing requires it.
  
  const formattedData: Property[] = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      type: p.type === 'commercial' ? 'Commercial' : 'Residential', // Basic mapping
      units: p.total_units || p.units?.[0]?.count || 0,
      occupancy: 0, // Placeholder, calculating this efficiently requires complex queries
      image: p.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
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

  // Calculate occupancy if needed (as per original service)
  const unitIds = (data.units || []).map((u: any) => u.id);
  let occupiedUnits = 0;
  if (unitIds.length > 0) {
      const { count } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .in('unit_id', unitIds)
        .eq('status', 'active');
      occupiedUnits = count || 0;
  }
  const totalUnits = data.total_units || data.units?.length || 0;
  const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    type: data.type === 'commercial' ? 'Commercial' : 'Residential',
    units: totalUnits,
    occupancy,
    image: data.image_url
  };
}

export async function createEditProperty(newProperty: any, id?: string) {
  const hasImagePath = typeof newProperty.image === 'string' && newProperty.image.startsWith(supabaseUrl);
  
  // We accept either a file object (new upload) or a string (existing url)
  let imagePath = newProperty.image;
  let imageName = '';

  if (typeof newProperty.image === 'object' && newProperty.image !== null) {
      imageName = `${Math.random()}-${newProperty.image.name}`.replaceAll("/", "");
      imagePath = `${supabaseUrl}/storage/v1/object/public/property-images/${imageName}`;
  }

  // db column mapping
  const dbPayload = {
      name: newProperty.name,
      address: newProperty.address,
      type: newProperty.type.toLowerCase(), // 'Commercial' -> 'commercial'
      total_units: parseInt(newProperty.units),
      image_url: imagePath
  };

  let query = supabase.from("properties");

  // Create
  if (!id) {
    query = query.insert([dbPayload]);
  }

  // Edit
  if (id) {
    query = query.update(dbPayload).eq("id", id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error("Property could not be saved");
  }

  // If it was a string URL, we are done
  if (typeof newProperty.image === 'string') return data;

  // Upload image
  if (imageName) {
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
