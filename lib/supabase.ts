import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://placeholder-project.supabase.co"
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "placeholder-publishable-key"

export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey)
