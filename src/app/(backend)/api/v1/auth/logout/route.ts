import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";

export async function POST(): Promise<NextResponse> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        BackendApiRouteLogger.error("Failed to logout", { error });
        return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
