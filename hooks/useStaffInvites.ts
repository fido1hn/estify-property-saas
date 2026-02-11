import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createStaffInvite } from "../services/apiStaffInvites";

export function useCreateStaffInvite() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createInvite } = useMutation({
    mutationFn: createStaffInvite,
    onSuccess: () => {
      toast.success("Invite created");
      queryClient.invalidateQueries({ queryKey: ["staff_invites"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createInvite };
}
