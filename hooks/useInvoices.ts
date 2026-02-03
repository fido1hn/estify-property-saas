
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices, updateInvoice, deleteInvoice } from "../services/apiInvoices";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function useInvoices() {
  const [searchParams] = useSearchParams();

  const filterValue = searchParams.get("status");
  const filter = !filterValue || filterValue === "all"
    ? null
    : { field: "status", value: filterValue };

  const sortByRaw = searchParams.get("sortBy") || "due_date-asc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  const {
    isPending,
    data: { data: invoices, count } = {},
    error,
  } = useQuery({
    queryKey: ["invoices", filter, sortBy, page],
    queryFn: () => getInvoices({ filter, sortBy, page }),
  });

  return { isPending, error, invoices, count };
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();
    
    const { isPending: isUpdating, mutate: updateInv } = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: any }) => updateInvoice(id, updates),
        onSuccess: () => {
            toast.success("Invoice updated");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isUpdating, updateInv };
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();
    
    const { isPending: isDeleting, mutate: deleteInv } = useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            toast.success("Invoice deleted");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (err) => toast.error(err.message)
    });

    return { isDeleting, deleteInv };
}
