import { createClient } from "@supabase/supabase-js";
import { safelyGetEnv } from "../utils";

const supabaseUrl = safelyGetEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = safelyGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
