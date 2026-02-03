
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganization, updateOrganization } from "../services/apiOrganization";
import toast from "react-hot-toast";

export function useOrganization() {
  const { isPending, data: organization, error } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  return { isPending, error, organization };
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateOrg } = useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      toast.success("Organization successfully updated");
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateOrg };
}
