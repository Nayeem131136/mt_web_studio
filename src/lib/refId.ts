import { supabase } from "@/supabase";

/**
 * Atomically generates a unique reference ID like "MT-2026-0001" by calling the
 * generate_reference_id() Postgres function (see supabase-schema.sql). The
 * "insert ... on conflict ... do update ... returning" inside that function is
 * a single atomic statement, so concurrent submissions can never collide.
 */
export async function generateReferenceId(): Promise<string> {
  const { data, error } = await supabase.rpc("generate_reference_id");
  if (error) throw error;
  return data as string;
}

// Note: syncing public_status (the client-facing tracker mirror) now happens
// automatically via a database trigger whenever a lead is inserted or its
// status changes — see sync_public_status() in supabase-schema.sql. The app
// no longer needs to call anything to keep it up to date.
