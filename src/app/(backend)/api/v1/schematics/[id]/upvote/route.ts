import { NextResponse } from "next/server";
import { supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

type UpvoteResult = { data: Schematic.Engagement.EngagementRes } | IApiErrorResponse;

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpvoteResult>> {
    const { id: schematic_id } = await params;

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematic_increment_upvote", {
        schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to increment upvote", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to increment upvote")
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

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpvoteResult>> {
    const { id: schematic_id } = await params;

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematic_decrement_upvote", {
        schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to decrement upvote", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to decrement upvote")
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
