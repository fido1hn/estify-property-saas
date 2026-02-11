import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Database } from "../types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}

interface CompleteOwnerPayload {
  userId: string;
  role: UserRole;
  organizationName: string;
}

interface RedeemInvitePayload {
  userId: string;
  inviteCode: string;
}

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const signUp = async (payload: SignUpPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { fullName, email, password } = payload;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
      });

      if (profileError) {
        console.warn(
          "Profile creation error (might be handled by trigger):",
          profileError,
        );
      }
      return { error: null, userId: authData.user.id };
    } catch (err: any) {
      const message = err?.message || "An error occurred during sign up";
      setError(message);
      return { error: err, userId: null };
    } finally {
      setLoading(false);
    }
  };

  const completeOwnerSetup = async (payload: CompleteOwnerPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { userId, role, organizationName } = payload;

      if (role !== "owner") {
        throw new Error("Only property owner signup");
      }

      if (!organizationName) {
        throw new Error("Organization name is required");
      }

      // insert user_role row to user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert({
        id: userId,
        user_role: role,
      });

      if (roleError) throw roleError;

      // insert org to org table
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: organizationName,
          owner_id: userId,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      return { error: null };
    } catch (err: any) {
      const message =
        err?.message || "An error occurred during organization setup";
      setError(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const redeemTenantInvite = async (payload: RedeemInvitePayload) => {
    setLoading(true);
    setError(null);

    try {
      const { userId, inviteCode } = payload;

      if (!inviteCode) {
        throw new Error("Invite code is required");
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "redeem-tenant-invite",
        {
          body: { invite_code: inviteCode, user_id: userId },
        },
      );

      if (fnError) throw fnError;
      if (!data?.success) {
        throw new Error("Invite redemption failed");
      }

      return { error: null };
    } catch (err: any) {
      const message = err?.message || "An error occurred during invite redemption";
      setError(message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return { signUp, completeOwnerSetup, redeemTenantInvite, loading, error, clearError };
}
