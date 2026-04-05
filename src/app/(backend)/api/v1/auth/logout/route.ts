import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { ApiError, ApiErrorCode, ApiResponse, ApiResponseCode } from "@/lib/api-responses";

export async function POST(): Promise<NextResponse> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        BackendApiRouteLogger.error("Failed to logout", { error });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("登出失败")
            .details({ detail: error.message })
            .build();
    }

    return new ApiResponse().code(ApiResponseCode.NO_CONTENT).build();
}
