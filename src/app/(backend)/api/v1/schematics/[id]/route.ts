import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type SchematicDetailResult =
    | WrapSchema<Schematic.Schematic.SchematicRes>
    | IApiErrorResponse;

export type SchematicUpdateResult =
    | WrapSchema<Schematic.Schematic.SchematicRes>
    | IApiErrorResponse;

export type SchematicDeleteResult = { data: { success: boolean } } | IApiErrorResponse;

async function checkVisibility(
    schematic: { author_id: string; status: string },
    user: { id: string } | null,
    supabaseAdmin: typeof supabaseServerAdmin
): Promise<{ allowed: boolean; reason?: string }> {
    if (schematic.status === "published") {
        return { allowed: true };
    }

    if (!user) {
        return { allowed: false, reason: "未授权访问非公开内容" };
    }

    if (schematic.author_id === user.id) {
        return { allowed: true };
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const userRole = profile?.role;
    if (userRole === "creator" || userRole === "admin") {
        return { allowed: true };
    }

    return { allowed: false, reason: "无权访问该内容" };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SchematicDetailResult>> {
    const supabase = await createSupabaseServerClient();
    const { id: schematicId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: schematic, error: fetchError } = await supabaseServerAdmin
        .from("schematics")
        .select("*")
        .eq("id", schematicId)
        .single();

    if (fetchError || !schematic) {
        BackendApiRouteLogger.warn("Schematic not found", { error: fetchError, schematicId });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("原理图不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    const visibilityCheck = await checkVisibility(schematic, user, supabaseServerAdmin);
    if (!visibilityCheck.allowed) {
        return new ApiError()
            .code(ApiErrorCode.FORBIDDEN)
            .message(visibilityCheck.reason ?? "无权访问")
            .build();
    }

    await supabaseServerAdmin.rpc("rpc__schematic_increment_viewed", {
        schematic_id: schematicId,
    });

    const { data: categories, error: categoryError } = await supabaseServerAdmin.rpc(
        "rpc__schematic_get_categories",
        { schematic_id: schematicId }
    );

    if (categoryError) {
        BackendApiRouteLogger.warn("Failed to fetch categories for schematic", {
            error: categoryError,
            schematicId,
        });
    }

    const categoryList =
        categories?.map((c: { id: string; name: string; slug: string }) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
        })) ?? [];

    const { data: authorProfile } = await supabaseServerAdmin
        .from("profiles")
        .select("display_name")
        .eq("user_id", schematic.author_id)
        .single();

    const authorName =
        typeof authorProfile?.display_name === "string" && authorProfile.display_name.trim().length > 0
            ? authorProfile.display_name.trim()
            : null;

    return new ApiResponse<Schematic.Schematic.SchematicRes>()
        .code(ApiResponseCode.OK)
        .data({
            schematic: {
                id: schematic.id,
                author_id: schematic.author_id,
                author_name: authorName,
                name: schematic.name,
                description: schematic.description,
                status: schematic.status,
                format: schematic.format,
                mc_version: schematic.mc_version,
                tags: schematic.tags,
                file_url: schematic.file_url,
                images: schematic.images,
                upvotes: schematic.upvotes,
                starred: schematic.starred,
                viewed: schematic.viewed + 1,
                created_at: schematic.created_at,
                updated_at: schematic.updated_at,
            },
            categories: categoryList,
        })
        .build();
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SchematicUpdateResult>> {
    const supabase = await createSupabaseServerClient();
    const { id: schematicId } = await params;

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized update attempt", { error: authError });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    const { data: schematic, error: fetchError } = await supabaseServerAdmin
        .from("schematics")
        .select("*")
        .eq("id", schematicId)
        .single();

    if (fetchError || !schematic) {
        BackendApiRouteLogger.warn("Schematic not found for update", {
            error: fetchError,
            schematicId,
        });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("原理图不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    const { data: profile } = await supabaseServerAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const userRole = profile?.role;
    const isAdmin = userRole === "admin";
    const isAuthor = schematic.author_id === user.id;

    if (!isAdmin && !isAuthor) {
        return new ApiError().code(ApiErrorCode.FORBIDDEN).message("无权修改此原理图").build();
    }

    let body: Schematic.Schematic.UpdateSchematicReq & { category_ids?: string[] };
    try {
        body = await request.json();
    } catch {
        return new ApiError().code(ApiErrorCode.BAD_REQUEST).message("无效的请求体").build();
    }

    const parseResult = Schematic.Schematic.UpdateSchematicReqSchema.safeParse(body);
    if (!parseResult.success) {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("请求参数验证失败")
            .details({ errors: parseResult.error.flatten() })
            .build();
    }

    const validatedData = parseResult.data;

    if (isAuthor && !isAdmin && validatedData.status === "published") {
        return new ApiError()
            .code(ApiErrorCode.FORBIDDEN)
            .message("作者无法自行发布内容")
            .build();
    }

    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
        updateData.description = validatedData.description;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.format !== undefined) updateData.format = validatedData.format;
    if (validatedData.mc_version !== undefined)
        updateData.mc_version = validatedData.mc_version;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.file_url !== undefined) updateData.file_url = validatedData.file_url;
    if (validatedData.images !== undefined) updateData.images = validatedData.images;

    // 作者修改已发布内容后，自动重新进入审核
    if (isAuthor && !isAdmin && schematic.status === "published") {
        updateData.status = "under_review";
    }

    if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseServerAdmin
            .from("schematics")
            .update(updateData)
            .eq("id", schematicId);

        if (updateError) {
            BackendApiRouteLogger.error("Failed to update schematic", {
                error: updateError,
                schematicId,
            });
            return new ApiError()
                .code(ApiErrorCode.SERVER_ERROR)
                .message("更新原理图失败")
                .details({ error: updateError.message })
                .build();
        }
    }

    let categories: Array<{ id: string; name: string; slug: string }> = [];

    if (body.category_ids !== undefined) {
        const { error: categoryError } = await supabaseServerAdmin.rpc(
            "rpc__schematic_set_categories",
            {
                schematic_id: schematicId,
                category_ids: body.category_ids,
            }
        );

        if (categoryError) {
            BackendApiRouteLogger.warn("Failed to set categories for schematic", {
                error: categoryError,
                schematicId,
            });
        }
    }

    const { data: updatedSchematic } = await supabaseServerAdmin
        .from("schematics")
        .select("*")
        .eq("id", schematicId)
        .single();

    const { data: categoryData } = await supabaseServerAdmin.rpc(
        "rpc__schematic_get_categories",
        {
            schematic_id: schematicId,
        }
    );

    if (categoryData) {
        categories = categoryData.map((c: { id: string; name: string; slug: string }) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
        }));
    }

    return new ApiResponse<Schematic.Schematic.SchematicRes>()
        .code(ApiResponseCode.OK)
        .data({
            schematic: {
                id: updatedSchematic.id,
                author_id: updatedSchematic.author_id,
                name: updatedSchematic.name,
                description: updatedSchematic.description,
                status: updatedSchematic.status,
                format: updatedSchematic.format,
                mc_version: updatedSchematic.mc_version,
                tags: updatedSchematic.tags,
                file_url: updatedSchematic.file_url,
                images: updatedSchematic.images,
                upvotes: updatedSchematic.upvotes,
                starred: updatedSchematic.starred,
                viewed: updatedSchematic.viewed,
                created_at: updatedSchematic.created_at,
                updated_at: updatedSchematic.updated_at,
            },
            categories,
        })
        .build();
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SchematicDeleteResult>> {
    const supabase = await createSupabaseServerClient();
    const { id: schematicId } = await params;

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized delete attempt", { error: authError });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    const { data: schematic, error: fetchError } = await supabaseServerAdmin
        .from("schematics")
        .select("author_id, status")
        .eq("id", schematicId)
        .single();

    if (fetchError || !schematic) {
        BackendApiRouteLogger.warn("Schematic not found for delete", {
            error: fetchError,
            schematicId,
        });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("原理图不存在")
            .details({ error: fetchError?.message ?? "Not found" })
            .build();
    }

    const { data: profile } = await supabaseServerAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const userRole = profile?.role;
    const isAdmin = userRole === "admin";
    const isAuthor = schematic.author_id === user.id;

    if (!isAdmin && !isAuthor) {
        return new ApiError().code(ApiErrorCode.FORBIDDEN).message("无权删除此原理图").build();
    }

    const { error: deleteError } = await supabaseServerAdmin
        .from("schematics")
        .delete()
        .eq("id", schematicId);

    if (deleteError) {
        BackendApiRouteLogger.error("Failed to delete schematic", {
            error: deleteError,
            schematicId,
        });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("删除原理图失败")
            .details({ error: deleteError.message })
            .build();
    }

    return new ApiResponse<{ success: boolean }>()
        .code(ApiResponseCode.OK)
        .data({ success: true })
        .build();
}
