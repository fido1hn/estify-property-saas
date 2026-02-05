import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type RedeemInviteBody = {
  code?: string;
  full_name?: string;
  email?: string;
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: RedeemInviteBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const code = body.code?.trim();
  if (!code) {
    return new Response(JSON.stringify({ error: "Invite code is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: invite, error: inviteError } = await adminClient
    .from("invites")
    .select("*")
    .eq("code", code)
    .single();

  if (inviteError || !invite) {
    return new Response(JSON.stringify({ error: "Invalid invite code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!invite.active) {
    return new Response(JSON.stringify({ error: "Invite is inactive" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "Invite has expired" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (invite.used_count >= invite.max_uses) {
    return new Response(JSON.stringify({ error: "Invite has been fully used" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (invite.role === "admin" || invite.role === "owner") {
    return new Response(JSON.stringify({ error: "Invalid invite role" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: existingRole } = await adminClient
    .from("user_roles")
    .select("user_role")
    .eq("user_id", user.id)
    .single();

  if (existingRole?.user_role && existingRole.user_role !== invite.role) {
    return new Response(JSON.stringify({ error: "User already has a role" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fullName = body.full_name ?? user.user_metadata?.full_name ?? "";
  const email = body.email ?? user.email ?? "";

  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        email,
        organization_id: invite.organization_id,
        role: invite.role,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    return new Response(JSON.stringify({ error: "Profile creation failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: roleError } = await adminClient
    .from("user_roles")
    .upsert(
      { user_id: user.id, user_role: invite.role },
      { onConflict: "user_id" },
    );

  if (roleError) {
    return new Response(JSON.stringify({ error: "Role assignment failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const nextUsedCount = invite.used_count + 1;
  const shouldDeactivate = nextUsedCount >= invite.max_uses;

  await adminClient
    .from("invites")
    .update({
      used_count: nextUsedCount,
      active: shouldDeactivate ? false : invite.active,
    })
    .eq("id", invite.id);

  return new Response(
    JSON.stringify({
      success: true,
      organization_id: invite.organization_id,
      role: invite.role,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
