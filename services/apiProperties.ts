
import { supabase, supabaseUrl } from "./supabaseClient";
import { PAGE_SIZE } from "../utils/constants";
import { Property, PropertyInsert } from "../types";

type PropertyFormPayload = {
  name: string;
  address: string;
  type: "residential" | "commercial";
  total_units: number;
  image_url?: string;
  image?: File | string | null;
};

type PropertyFilter =
  | {
      field: "type";
      value: "residential" | "commercial";
    }
  | null;

type PropertySort = {
  field: string;
  direction: "asc" | "desc";
};

type RawProperty = {
  image_url?: string | null;
  total_units?: number | null;
  units?: { count: number }[];
  [key: string]: unknown;
};

export async function getProperties({
  filter,
  sortBy,
  page,
}: {
  filter?: PropertyFilter;
  sortBy?: PropertySort;
  page?: number;
} = {}) {
  let query = supabase.from("properties").select("*, units(count)");

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
  const formattedData: Property[] = (data as RawProperty[]).map((p) => ({
    ...(p as unknown as Property),
    image_url:
      p.image_url ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
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

  const propertyData = data as unknown as Property & {
    units?: { id: string }[];
  };

  // Calculate occupancy
  const unitIds = (propertyData.units || []).map((u) => u.id);
  let occupiedUnits = 0;
  if (unitIds.length > 0) {
    const { count, error: occupantsError } = await supabase
      .from("unit_occupants")
      .select("*", { count: "exact", head: true })
      .in("unit_id", unitIds)
      .is("left_at", null);
    if (!occupantsError) {
      occupiedUnits = count || 0;
    }
  }
  const totalUnits = propertyData.total_units || propertyData.units?.length || 0;
  const occupancy =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const result: Property = {
    ...propertyData,
    total_units: totalUnits, // Update total_units if calculation logic differs, otherwise keep propertyData.total_units
    occupancy,
  };

  return result;
}

export async function createEditProperty(
  newProperty: PropertyFormPayload,
  organizationId: string,
  id?: string,
) {
  if (!organizationId) {
    throw new Error("Organization is required to save a property");
  }

  let imagePath = newProperty.image_url || newProperty.image;
  let imageName = "";

  // If it's a file object
  if (typeof newProperty.image === "object" && newProperty.image !== null) {
    imageName = `${Math.random()}-${newProperty.image.name}`.replaceAll(
      "/",
      "",
    );
    imagePath = `${supabaseUrl}/storage/v1/object/public/property-images/${imageName}`;
  }

  // db column mapping
  const dbPayload: PropertyInsert = {
    name: newProperty.name,
    address: newProperty.address,
    type: newProperty.type,
    total_units: Number(newProperty.total_units),
    image_url: imagePath ? String(imagePath) : null,
    organization_id: organizationId,
  };

  // Create
  if (!id) {
    const { data, error } = await supabase
      .from("properties")
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error("Property could not be saved");
    }

    // If it was a string URL (no new upload), we are done
    if (typeof newProperty.image === "string") return data;

    // Upload image if needed
    if (imageName && typeof newProperty.image === "object") {
      const { error: storageError } = await supabase.storage
        .from("property-images")
        .upload(imageName, newProperty.image);

      if (storageError) {
        await supabase.from("properties").delete().eq("id", data.id);
        console.error(storageError);
        throw new Error(
          "Property image could not be uploaded and the property was not created",
        );
      }
    }

    return data;
  }

  // Edit
  const { data, error } = await supabase
    .from("properties")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Property could not be saved");
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
