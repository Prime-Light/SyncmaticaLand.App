import { createClient } from "@supabase/supabase-js";
import { safelyGetEnv } from "../utils";

const supabaseUrl = safelyGetEnv("SUPABASE_URL");
const supabaseKey = safelyGetEnv("SUPABASE_SERVICE_KEY");
export const supabaseServer = createClient(supabaseUrl, supabaseKey);
