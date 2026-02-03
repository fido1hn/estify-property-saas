
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenants, getTenant, updateTenant } from "../services/apiTenants";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function useTenants() {
  const [searchParams] = useSearchParams();

  const filterValue = searchParams.get("status");
  const filter = !filterValue || filterValue === "all"
    ? null
    : { field: "status", value: filterValue };

  const sortByRaw = searchParams.get("sortBy") || "created_at-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isPending,
    data: { data: tenants, count } = {},
    error,
  } = useQuery({
    queryKey: ["tenants", filter, sortBy, page],
    queryFn: () => getTenants({ filter, sortBy, page }),
  });

  return { isPending, error, tenants, count };
}

export function useTenant(id: string) {
    const { isPending, data: tenant, error } = useQuery({
        queryKey: ["tenant", id],
        queryFn: () => getTenant(id),
        retry: false
    });
    return { isPending, error, tenant };
}

export function useUpdateTenant() {
    const queryClient = useQueryClient();
    
    const { isPending: isUpdating, mutate: updateTnt } = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => updateTenant(id, updates),
        onSuccess: () => {
            toast.success("Tenant updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
            queryClient.invalidateQueries({ queryKey: ["tenant"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isUpdating, updateTnt };
}
