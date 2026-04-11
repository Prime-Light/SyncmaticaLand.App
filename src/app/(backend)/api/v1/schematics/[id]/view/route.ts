import { NextResponse } from "next/server";
import { supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

type ViewResult = { data: Schematic.Engagement.EngagementRes } | IApiErrorResponse;

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ViewResult>> {
    const { id: schematic_id } = await params;

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematic_increment_viewed", {
        schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to increment view", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to increment view")
            .details({ error: error.message })
            .build();
    }

    return new ApiResponse<Schematic.Engagement.EngagementRes>()
        .code(ApiResponseCode.OK)
        .data({
            success: true,
            new_count: data,
        })
        .build();
}
