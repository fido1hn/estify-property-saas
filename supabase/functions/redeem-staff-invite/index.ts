// Edge Function: redeem-staff-invite
// Purpose:
// - Validate invite code
// - Ensure invite is pending + not expired
// - Create staff row
// - Assign staff role
// - Mark invite as redeemed

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type InviteRow = {
  id: string;
  text_code: string;
  organization_id: string;
  status: "pending" | "redeemed" | "expired" | "revoked";
  expires_at: string | null;
  redeemed_at: string | null;
  redeemed_by: string | null;
};

type RedeemPayload = {
  invite_code: string;
  user_id: string;
};

// Simple permissive CORS. Adjust if you need stricter origins.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Supabase Edge Functions expect these env vars (not VITE_*).
  // The CLI injects them when you run `supabase functions serve`.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase environment variables" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Parse request body
  let payload: RedeemPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { invite_code, user_id } = payload;

  if (!invite_code || !user_id) {
    return new Response(
      JSON.stringify({ error: "invite_code and user_id are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Service role client bypasses RLS (required for invite redemption)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 1) Lookup invite by code
  const { data: invite, error: inviteError } = await supabase
    .from("staff_invites")
    .select("*")
    .eq("text_code", invite_code)
    .single();

  if (inviteError || !invite) {
    return new Response(JSON.stringify({ error: "Invalid invite code" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const typedInvite = invite as InviteRow;

  // 2) Validate invite state
  if (typedInvite.status !== "pending") {
    return new Response(JSON.stringify({ error: "Invite is not pending" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (typedInvite.expires_at && new Date(typedInvite.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "Invite has expired" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3) Ensure staff row exists
  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!staffRow) {
    const { error: staffError } = await supabase
      .from("staff")
      .insert({ id: user_id, status: "inactive" });

    if (staffError) {
      return new Response(JSON.stringify({ error: "Failed to create staff" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // 4) Ensure user role is staff
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!roleRow) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ id: user_id, user_role: "staff" });

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "Failed to assign staff role" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  // 5) Mark invite as redeemed
  const { error: inviteUpdateError } = await supabase
    .from("staff_invites")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
      redeemed_by: user_id,
    })
    .eq("id", typedInvite.id);

  if (inviteUpdateError) {
    return new Response(JSON.stringify({ error: "Failed to redeem invite" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      staff_id: user_id,
      invite_id: typedInvite.id,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
