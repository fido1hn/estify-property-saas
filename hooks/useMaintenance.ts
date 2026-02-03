
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMaintenanceRequests, getMaintenanceRequest, createMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest } from "../services/apiMaintenance";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function useMaintenance() {
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
    data: { data: requests, count } = {},
    error,
  } = useQuery({
    queryKey: ["maintenance", filter, sortBy, page],
    queryFn: () => getMaintenanceRequests({ filter, sortBy, page }),
  });

  return { isPending, error, maintenanceRequests: requests, count };
}

export function useMaintenanceRequest(id: string) {
    const { isPending, data: request, error } = useQuery({
        queryKey: ["maintenance", id],
        queryFn: () => getMaintenanceRequest(id),
        retry: false
    });
    return { isPending, error, request };
}

export function useCreateMaintenance() {
    const queryClient = useQueryClient();
    
    const { isPending: isCreating, mutate: createMaintenance } = useMutation({
        mutationFn: createMaintenanceRequest,
        onSuccess: () => {
            toast.success("Maintenance request created");
            queryClient.invalidateQueries({ queryKey: ["maintenance"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isCreating, createMaintenance };
}

export function useUpdateMaintenance() {
    const queryClient = useQueryClient();
    
    const { isPending: isUpdating, mutate: updateRequest } = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => updateMaintenanceRequest(id, updates),
        onSuccess: () => {
            toast.success("Request updated");
            queryClient.invalidateQueries({ queryKey: ["maintenance"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isUpdating, updateMaintenance: updateRequest };
}

export function useDeleteMaintenance() {
    const queryClient = useQueryClient();
    
    const { isPending: isDeleting, mutate: deleteRequest } = useMutation({
        mutationFn: deleteMaintenanceRequest,
        onSuccess: () => {
            toast.success("Request deleted");
            queryClient.invalidateQueries({ queryKey: ["maintenance"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isDeleting, deleteMaintenance: deleteRequest };
}
