import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabaseClient";
import { Database } from "../types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Enums"]["user_role"];

export function useAuthProfile(userId?: string | null) {
  return useQuery<Profile | null>({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export function useAuthRole(userId?: string | null) {
  return useQuery<UserRole | null>({
    queryKey: ["user_role", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_role")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data?.user_role ?? null) as UserRole | null;
    },
  });
}
