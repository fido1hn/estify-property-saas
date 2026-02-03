
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getStaffList, getStaff, updateStaff, createStaff, deleteStaff } from "../services/apiStaff";
import { useSearchParams } from "react-router-dom";

export function useStaff() {
  const [searchParams] = useSearchParams();

  // Likely filtering by Role or Status
  const roleFilter = searchParams.get("role");
  const filter = !roleFilter || roleFilter === "all"
    ? null
    : { field: "role", value: roleFilter };

  const sortByRaw = searchParams.get("sortBy") || "created_at-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isPending,
    data: { data: staff, count } = {},
    error,
  } = useQuery({
    queryKey: ["staff", filter, sortBy, page],
    queryFn: () => getStaffList({ filter, sortBy, page }),
  });

  return { isPending, error, staff, count };
}

export function useStaffMember(id: string) {
    const { isPending, data: staffMember, error } = useQuery({
        queryKey: ["staff", id],
        queryFn: () => getStaff(id),
        retry: false
    });
    return { isPending, error, staffMember };
}

export function useCreateStaff() {
    const queryClient = useQueryClient();
    
    const { isPending: isCreating, mutate: createStf } = useMutation({
        mutationFn: createStaff,
        onSuccess: () => {
            toast.success("Staff member created successfully");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isCreating, createStf };
}

export function useEditStaff() {
    const queryClient = useQueryClient();
    
    const { isPending: isEditing, mutate: editStf } = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => updateStaff(id, updates),
        onSuccess: () => {
            toast.success("Staff profile updated");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isEditing, editStf };
}

export function useDeleteStaff() {
    const queryClient = useQueryClient();
    
    const { isPending: isDeleting, mutate: deleteStf } = useMutation({
        mutationFn: deleteStaff,
        onSuccess: () => {
            toast.success("Staff member removed");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isDeleting, deleteStf };
}
