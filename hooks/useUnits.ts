import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createUnit,
  deleteUnit,
  getUnitsByProperty,
  updateUnit,
} from "../services/apiUnits";

export function useUnitsByProperty(propertyId: string | undefined) {
  const { isPending, data: units = [], error } = useQuery({
    queryKey: ["units", propertyId],
    queryFn: () => getUnitsByProperty(propertyId!),
    enabled: !!propertyId,
  });

  return { isPending, units, error };
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createUnitMutate } = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      toast.success("Unit created");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createUnit: createUnitMutate };
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateUnitMutate } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateUnit>[1] }) =>
      updateUnit(id, updates),
    onSuccess: () => {
      toast.success("Unit updated");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateUnit: updateUnitMutate };
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteUnitMutate } = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteUnit: deleteUnitMutate };
}
