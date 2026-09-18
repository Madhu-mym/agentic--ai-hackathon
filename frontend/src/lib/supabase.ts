import { createClient } from "@supabase/supabase-js";

/**
 * Centralized Supabase Client for authentication and database queries.
 *
 * Environment variables must be defined in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
