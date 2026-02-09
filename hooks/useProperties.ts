
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProperties, getProperty, createEditProperty, deleteProperty } from "../services/apiProperties";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

// Fetch All Properties with Filters/Sort/Pagination
export function useProperties() {
  const [searchParams] = useSearchParams();

  // FILTER
  const filterValue = searchParams.get("type");
  const filter = !filterValue || filterValue === "all"
    ? null
    : { field: "type", value: filterValue }; // api expects lowercase 'commercial' etc

  // SORT
  const sortByRaw = searchParams.get("sortBy") || "created_at-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  // PAGINATION
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isPending,
    data: { data: properties, count } = {},
    error,
  } = useQuery({
    queryKey: ["properties", filter, sortBy, page],
    queryFn: () => getProperties({ filter, sortBy, page }),
  });

  return { isPending, error, properties, count };
}

// Fetch Single Property
export function useProperty(id: string) {
    const { isPending, data: property, error } = useQuery({
        queryKey: ["property", id],
        queryFn: () => getProperty(id),
        enabled: !!id, // Only run if ID exists
        retry: false
    });
    return { isPending, error, property };
}

// Create or Edit Property
export function useCreateProperty() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createProperty } = useMutation({
    mutationFn: ({
      data,
      organizationId,
    }: {
      data: Parameters<typeof createEditProperty>[0];
      organizationId: string;
    }) => createEditProperty(data, organizationId),
    onSuccess: () => {
      toast.success("New property successfully created");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createProperty };
}

export function useEditProperty() {
  const queryClient = useQueryClient();

  const { isPending: isEditing, mutate: editProperty } = useMutation({
    mutationFn: ({
      data,
      id,
      organizationId,
    }: {
      data: Parameters<typeof createEditProperty>[0];
      id: string;
      organizationId: string;
    }) => createEditProperty(data, organizationId, id),
    onSuccess: () => {
      toast.success("Property successfully updated");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      // Also invalidate single property view
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isEditing, editProperty };
}

// Delete Property
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteProp } = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      toast.success("Property successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteProp };
}
