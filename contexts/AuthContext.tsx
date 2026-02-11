import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Database } from "../types";
import { useAuthProfile, useAuthRole } from "../hooks/useAuthQueries";

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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;

      if (!session?.user) {
        setIsAuthenticated(false);
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
        created_at: session.user.created_at,
      });
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        setIsAuthenticated(false);
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
        created_at: session.user.created_at,
      });
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const { data: profile, isPending: profileLoading } = useAuthProfile(authUser?.id);
  const { data: role, isPending: roleLoading } = useAuthRole(authUser?.id);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      authUser: authUser ?? null,
      profile: profile ?? null,
      role: role ?? null,
      loading:
        authLoading ||
        (!!authUser?.id ? profileLoading || roleLoading : false),
      signOut,
    }),
    [authUser, isAuthenticated, profile, role, authLoading, profileLoading, roleLoading],
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
