import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type CategoriesResult =
    | { data: Schematic.Category.CategoryListRes }
    | IApiErrorResponse;

export async function GET(): Promise<NextResponse<CategoriesResult>> {
    const supabase = await createSupabaseServerClient();

    const { data: categories, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, icon_url, created_at, updated_at")
        .order("name", { ascending: true });

    if (error) {
        BackendApiRouteLogger.error("Failed to fetch categories", { error });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("获取分类列表失败")
            .details({ error: error.message })
            .build();
    }

    return new ApiResponse<Schematic.Category.CategoryListRes>()
        .code(ApiResponseCode.OK)
        .data({
            categories: categories ?? [],
            total: categories?.length ?? 0,
        })
        .build();
}
