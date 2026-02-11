import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTenantInvite } from "../services/apiTenantInvites";

export function useCreateTenantInvite() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createInvite } = useMutation({
    mutationFn: createTenantInvite,
    onSuccess: () => {
      toast.success("Invite created");
      queryClient.invalidateQueries({ queryKey: ["tenant_invites"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createInvite };
}
