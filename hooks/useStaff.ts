
import { useQuery } from "@tanstack/react-query";
import { getStaffList } from "../services/apiStaff";
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
