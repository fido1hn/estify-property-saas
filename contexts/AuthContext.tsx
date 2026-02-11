import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Database } from "../types";

type UserRole = Database["public"]["Enums"]["user_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthUser = {
  id: string;
  email?: string;
  created_at?: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfileAndRole(userId: string) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("user_role")
          .eq("id", userId)
          .maybeSingle();

        if (roleError) throw roleError;

        if (isMounted) {
          setProfile(profileData ?? null);
          setRole(roleData?.user_role ?? null);
        }
      } catch (error) {
        if (isMounted) {
          setProfile(null);
          setRole(null);
        }
        console.error("Error fetching user data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      if (!session?.user) {
        setIsAuthenticated(false);
        setAuthUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
        created_at: session.user.created_at,
      });
      setLoading(true);
      fetchProfileAndRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        setIsAuthenticated(false);
        setAuthUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
        created_at: session.user.created_at,
      });
      setLoading(true);
      fetchProfileAndRole(session.user.id);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      authUser: authUser ?? null,
      profile,
      role,
      loading,
      signOut,
    }),
    [authUser, isAuthenticated, profile, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthStateProvider");
  }
  return context;
};
