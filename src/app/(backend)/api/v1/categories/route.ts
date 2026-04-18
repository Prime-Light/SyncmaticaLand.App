import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type CategoriesResult = { data: Schematic.Category.CategoryListRes } | IApiErrorResponse;

export type CategoryCreateResult =
    | WrapSchema<Schematic.Category.CategoryRes>
    | IApiErrorResponse;

async function checkAdminRole(
    userId: string
): Promise<{ isAdmin: boolean; error?: NextResponse<IApiErrorResponse> }> {
    const { data: profile, error: profileError } = await supabaseServerAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

    if (profileError) {
        BackendApiRouteLogger.error("Failed to fetch user profile", { error: profileError });
        return {
            isAdmin: false,
            error: new ApiError()
                .code(ApiErrorCode.NOT_FOUND)
                .message("用户资料不存在")
                .details({ error: `Error Code ${profileError.code}` })
                .build(),
        };
    }

    if (profile?.role !== "admin") {
        return {
            isAdmin: false,
            error: new ApiError()
                .code(ApiErrorCode.FORBIDDEN)
                .message("需要管理员权限")
                .build(),
        };
    }

    return { isAdmin: true };
}

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

export async function POST(request: Request): Promise<NextResponse<CategoryCreateResult>> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized create category attempt", {
            error: authError,
        });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    const adminCheck = await checkAdminRole(user.id);
    if (!adminCheck.isAdmin && adminCheck.error) {
        return adminCheck.error;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new ApiError().code(ApiErrorCode.BAD_REQUEST).message("无效的请求体").build();
    }

    const parseResult = Schematic.Category.CreateCategoryReqSchema.safeParse(body);
    if (!parseResult.success) {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("请求参数验证失败")
            .details({ errors: parseResult.error.flatten() })
            .build();
    }

    const validatedData = parseResult.data;

    const { data: newCategory, error: insertError } = await supabaseServerAdmin
        .from("categories")
        .insert({
            name: validatedData.name,
            slug: validatedData.slug,
            description: validatedData.description ?? null,
            icon_url: validatedData.icon_url ?? null,
        })
        .select()
        .single();

    if (insertError) {
        BackendApiRouteLogger.error("Failed to create category", { error: insertError });
        if (insertError.code === "23505") {
            return new ApiError()
                .code(ApiErrorCode.CONFLICT)
                .message("分类名称或 slug 已存在")
                .details({ error: insertError.message })
                .build();
        }
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("创建分类失败")
            .details({ error: insertError.message })
            .build();
    }

    return new ApiResponse<Schematic.Category.CategoryRes>()
        .code(ApiResponseCode.CREATED)
        .data({
            category: {
                id: newCategory.id,
                name: newCategory.name,
                slug: newCategory.slug,
                description: newCategory.description,
                icon_url: newCategory.icon_url,
                created_at: newCategory.created_at,
                updated_at: newCategory.updated_at,
            },
        })
        .build();
}
