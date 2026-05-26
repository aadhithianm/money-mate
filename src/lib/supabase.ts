import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.warn(
      "[Supabase] Supabase credentials not found in environment variables. Offline-first local mode will be active without sync persistence."
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
