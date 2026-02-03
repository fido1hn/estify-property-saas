
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, getChatHistory, sendMessage } from "../services/apiMessages";
import toast from "react-hot-toast";

export function useContacts() {
    const { isPending, data: contacts, error } = useQuery({
        queryKey: ["contacts"],
        queryFn: getContacts
    });
    return { isPending, error, contacts };
}

export function useChatHistory(contactId: string | null) {
    const { isPending, data: history, error } = useQuery({
        queryKey: ["chat", contactId],
        queryFn: () => contactId ? getChatHistory(contactId) : Promise.resolve([]),
        enabled: !!contactId
    });
    return { isPending, error, history };
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    
    const { isPending: isSending, mutate: send } = useMutation({
        mutationFn: ({ receiverId, content }: { receiverId: string, content: string }) => sendMessage(receiverId, content),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat", variables.receiverId] });
        },
        onError: (err) => toast.error(err.message)
    });
    return { isSending, send };
}
