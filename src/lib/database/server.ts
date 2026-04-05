import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safelyGetEnv } from "../utils";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        safelyGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
        safelyGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        },
    );
}

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
    },
);
