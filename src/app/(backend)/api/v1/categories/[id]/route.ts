import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type CategoryDetailResult =
    | WrapSchema<Schematic.Category.CategoryRes>
    | IApiErrorResponse;

export type CategoryUpdateResult =
    | WrapSchema<Schematic.Category.CategoryRes>
    | IApiErrorResponse;

export type CategoryDeleteResult = { data: { success: boolean } } | IApiErrorResponse;

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

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CategoryDetailResult>> {
    const { id: categoryId } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: category, error: fetchError } = await supabase
        .from("categories")
        .select("id, name, slug, description, icon_url, created_at, updated_at")
        .eq("id", categoryId)
        .single();

    if (fetchError || !category) {
        BackendApiRouteLogger.warn("Category not found", { error: fetchError, categoryId });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("分类不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    return new ApiResponse<Schematic.Category.CategoryRes>()
        .code(ApiResponseCode.OK)
        .data({
            category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                icon_url: category.icon_url,
                created_at: category.created_at,
                updated_at: category.updated_at,
            },
        })
        .build();
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CategoryUpdateResult>> {
    const supabase = await createSupabaseServerClient();
    const { id: categoryId } = await params;

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized update category attempt", { error: authError });
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

    const { data: existingCategory, error: fetchError } = await supabaseServerAdmin
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

    if (fetchError || !existingCategory) {
        BackendApiRouteLogger.warn("Category not found for update", {
            error: fetchError,
            categoryId,
        });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("分类不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("无效的请求体")
            .build();
    }

    const parseResult = Schematic.Category.UpdateCategoryReqSchema.safeParse(body);
    if (!parseResult.success) {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("请求参数验证失败")
            .details({ errors: parseResult.error.flatten() })
            .build();
    }

    const validatedData = parseResult.data;

    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.icon_url !== undefined) updateData.icon_url = validatedData.icon_url;

    if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseServerAdmin
            .from("categories")
            .update(updateData)
            .eq("id", categoryId);

        if (updateError) {
            BackendApiRouteLogger.error("Failed to update category", {
                error: updateError,
                categoryId,
            });
            if (updateError.code === "23505") {
                return new ApiError()
                    .code(ApiErrorCode.CONFLICT)
                    .message("分类名称或 slug 已存在")
                    .details({ error: updateError.message })
                    .build();
            }
            return new ApiError()
                .code(ApiErrorCode.SERVER_ERROR)
                .message("更新分类失败")
                .details({ error: updateError.message })
                .build();
        }
    }

    const { data: updatedCategory } = await supabaseServerAdmin
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

    return new ApiResponse<Schematic.Category.CategoryRes>()
        .code(ApiResponseCode.OK)
        .data({
            category: {
                id: updatedCategory.id,
                name: updatedCategory.name,
                slug: updatedCategory.slug,
                description: updatedCategory.description,
                icon_url: updatedCategory.icon_url,
                created_at: updatedCategory.created_at,
                updated_at: updatedCategory.updated_at,
            },
        })
        .build();
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CategoryDeleteResult>> {
    const supabase = await createSupabaseServerClient();
    const { id: categoryId } = await params;

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized delete category attempt", { error: authError });
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

    const { data: existingCategory, error: fetchError } = await supabaseServerAdmin
        .from("categories")
        .select("id")
        .eq("id", categoryId)
        .single();

    if (fetchError || !existingCategory) {
        BackendApiRouteLogger.warn("Category not found for delete", {
            error: fetchError,
            categoryId,
        });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("分类不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    const { error: deleteError } = await supabaseServerAdmin
        .from("categories")
        .delete()
        .eq("id", categoryId);

    if (deleteError) {
        BackendApiRouteLogger.error("Failed to delete category", {
            error: deleteError,
            categoryId,
        });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("删除分类失败")
            .details({ error: deleteError.message })
            .build();
    }

    return new ApiResponse<{ success: boolean }>()
        .code(ApiResponseCode.OK)
        .data({ success: true })
        .build();
}
