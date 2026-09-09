import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

// Server-only client using the service role key.
// All database access happens through Next.js API routes, so the
// service key is never exposed to the browser.
//
// Next.js patches global fetch to cache GET requests by URL — without
// this override, an unfiltered query (e.g. "select all employee_devices")
// gets cached the first time it's called and silently goes stale.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
  },
});
