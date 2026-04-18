import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { IApiErrorResponse } from "@/types/api-error";

type UserActionsResult =
    | { data: { has_upvoted: boolean; has_starred: boolean } }
    | IApiErrorResponse;

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UserActionsResult>> {
    const { id: schematic_id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("rpc__schematic_get_user_actions", {
        p_schematic_id: schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to get user actions", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to get user actions")
            .details({ error: error.message })
            .build();
    }

    const defaultActions = { has_upvoted: false, has_starred: false };
    const result = Array.isArray(data) && data.length > 0 ? data[0] : defaultActions;

    return new ApiResponse<{ has_upvoted: boolean; has_starred: boolean }>()
        .code(ApiResponseCode.OK)
        .data({
            has_upvoted: result.has_upvoted ?? false,
            has_starred: result.has_starred ?? false,
        })
        .build();
}
