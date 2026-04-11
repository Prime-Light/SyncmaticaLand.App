import { NextResponse } from "next/server";
import { supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

type StarResult = { data: Schematic.Engagement.EngagementRes } | IApiErrorResponse;

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StarResult>> {
    const { id: schematic_id } = await params;

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematic_increment_starred", {
        schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to increment star", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to increment star")
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
): Promise<NextResponse<StarResult>> {
    const { id: schematic_id } = await params;

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematic_decrement_starred", {
        schematic_id,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to decrement star", { error, schematic_id });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("Failed to decrement star")
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
