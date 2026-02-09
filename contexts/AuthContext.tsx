import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Database } from "../types";

type UserRole = Database["public"]["Enums"]["user_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  isAuthenticated: boolean;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Check active session
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setIsAuthenticated(!!session);
  //     if (session?.user) {
  //       fetchProfileAndRole(session.user.id);
  //     } else {
  //       setLoading(false);
  //     }
  //   });

  //   // Listen for auth changes
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setIsAuthenticated(!!session);
  //     if (session?.user) {
  //       fetchProfileAndRole(session.user.id);
  //     } else {
  //       setProfile(null);
  //       setRole(null);
  //       setLoading(false);
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // async function fetchProfileAndRole(userId: string) {
  //   try {
  //     // Fetch profile
  //     const { data: profileData, error: profileError } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", userId)
  //       .single();

  //     if (profileData) {
  //       setProfile(profileData);
  //     }

  //     // Fetch role
  //     const { data: roleData, error: roleError } = await supabase
  //       .from("user_roles")
  //       .select("user_role")
  //       .eq("user_id", userId)
  //       .single();

  //     if (roleData) {
  //       setRole(roleData.user_role);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    isAuthenticated,
    profile,
    role,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
