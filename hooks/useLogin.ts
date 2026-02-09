import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return { error };
    }

    if (!data.session || !data.user) {
      const sessionError = new Error("Missing session after login");
      setError(sessionError.message);
      return { error: sessionError };
    }

    return { error: null };
  };

  return { signIn, loading, error, clearError };
}
