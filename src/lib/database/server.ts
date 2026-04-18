import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safelyGetEnv } from "../utils";

export const supabaseServerAdmin = createServerClient(
    safelyGetEnv("SUPABASE_URL"),
    safelyGetEnv("SUPABASE_SERVICE_KEY"),
    {
        cookies: {
            getAll() {
                return [];
            },
            setAll() {},
        },
    }
);
