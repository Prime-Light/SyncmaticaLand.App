import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { type SchematicListRes, type SchematicType } from "@/schema/schematic";
import { IApiErrorResponse } from "@/types/api-error";

export type CategorySchematicsResult = { data: SchematicListRes } | IApiErrorResponse;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CategorySchematicsResult>> {
    const { id: categoryId } = await params;
    const supabase = await createSupabaseServerClient();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    const { data: result, error } = await supabase.rpc("category_get_schematics", {
        p_category_id: categoryId,
        p_limit: limit,
        p_offset: offset,
        p_is_authenticated: isAuthenticated,
        p_user_id: user?.id ?? null,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to fetch schematics by category", {
            error,
            categoryId,
        });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("获取分类下的蓝图列表失败")
            .details({ error: error.message })
            .build();
    }

    if (!result) {
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("分类不存在或没有蓝图")
            .build();
    }

    const { schematics, categories, total } = result as {
        schematics: SchematicType[];
        categories: { id: string; name: string; slug: string }[];
        total: number;
    };

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return new ApiResponse<SchematicListRes>()
        .code(ApiResponseCode.OK)
        .data({
            schematics: schematics ?? [],
            categories: categories ?? [],
            total: total ?? 0,
            page: currentPage,
            page_size: limit,
            total_pages: totalPages,
        })
        .build();
}
