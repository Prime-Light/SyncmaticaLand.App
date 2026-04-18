import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Schematic, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type SchematicListResult =
    | WrapSchema<Schematic.Schematic.SchematicListRes>
    | IApiErrorResponse;

export type SchematicCreateResult =
    | WrapSchema<Schematic.Schematic.SchematicRes>
    | IApiErrorResponse;

interface SchematicWithCategories {
    id: string;
    author_id: string;
    name: string;
    description: string | null;
    status: Schematic.Schematic.ProjectStatus;
    format: Schematic.Schematic.ProjectFormat;
    mc_version: string;
    tags: string[];
    file_url: string;
    images: string[];
    upvotes: number;
    starred: number;
    viewed: number;
    created_at: string;
    updated_at: string;
    categories: Array<{
        id: string;
        name: string;
        slug: string;
    }> | null;
}

interface RpcSchematicsResult {
    schematics: SchematicWithCategories[];
    total: number;
}

interface ListQuery {
    status: Schematic.Schematic.ProjectStatus | null;
    categoryId: string | null;
    authorId: string | null;
    limit: number;
    offset: number;
}

function normalizeRpcSchematicsResult(data: unknown): RpcSchematicsResult {
    const payload = Array.isArray(data) ? data[0] : data;

    if (!payload || typeof payload !== "object") {
        return { schematics: [], total: 0 };
    }

    const result = payload as Partial<RpcSchematicsResult>;
    return {
        schematics: Array.isArray(result.schematics) ? result.schematics : [],
        total: typeof result.total === "number" ? result.total : 0,
    };
}

async function fetchSchematicsByTableFallback(
    db: typeof supabaseServerAdmin,
    query: ListQuery
): Promise<RpcSchematicsResult> {
    const needsCategoryFilter = !!query.categoryId;
    const baseQuery = db
        .from("schematics")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    if (query.status) {
        baseQuery.eq("status", query.status);
    }

    if (query.authorId) {
        baseQuery.eq("author_id", query.authorId);
    }

    const fallbackLimit = needsCategoryFilter ? 1000 : query.limit;
    const fallbackOffset = needsCategoryFilter ? 0 : query.offset;

    const { data: rows, error, count } = await baseQuery.range(
        fallbackOffset,
        fallbackOffset + fallbackLimit - 1
    );

    if (error) {
        throw error;
    }

    const schematicsWithCategories = await Promise.all(
        (rows ?? []).map(async (row) => {
            const { data: categories } = await db.rpc("rpc__schematic_get_categories", {
                schematic_id: row.id,
            });

            const normalizedCategories =
                categories?.map((c: { id: string; name: string; slug: string }) => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                })) ?? [];

            return {
                ...row,
                categories: normalizedCategories,
            } as SchematicWithCategories;
        })
    );

    let filtered = schematicsWithCategories;
    if (query.categoryId) {
        filtered = filtered.filter((s) =>
            (s.categories ?? []).some((c) => c.id === query.categoryId)
        );
    }

    const paged = needsCategoryFilter
        ? filtered.slice(query.offset, query.offset + query.limit)
        : filtered;

    return {
        schematics: paged,
        total: needsCategoryFilter ? filtered.length : count ?? paged.length,
    };
}

export async function GET(request: Request): Promise<NextResponse<SchematicListResult>> {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const listDb = supabase;

    const status = searchParams.get("status") as Schematic.Schematic.ProjectStatus | null;
    const categoryId = searchParams.get("category_id");
    const authorId = searchParams.get("author_id");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    let queryStatus = status;
    if (!user) {
        if (status && status !== "published") {
            return new ApiError()
                .code(ApiErrorCode.FORBIDDEN)
                .message("未授权访问非公开内容")
                .build();
        }
        queryStatus = "published";
    } else {
        const { data: profile } = await supabaseServerAdmin
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

        const userRole = profile?.role;
        const isCreator = userRole === "creator" || userRole === "admin";

        if (status && status !== "published") {
            if (status === "draft" && authorId !== user.id) {
                return new ApiError()
                    .code(ApiErrorCode.FORBIDDEN)
                    .message("无权访问他人的草稿")
                    .build();
            }
            if ((status === "under_review" || status === "rejected") && !isCreator && authorId !== user.id) {
                return new ApiError()
                    .code(ApiErrorCode.FORBIDDEN)
                    .message("无权访问该内容")
                    .build();
            }
        }
    }

    queryStatus = queryStatus ?? "published";

    const rpcQuery = {
        p_status: queryStatus,
        p_category_id: categoryId || null,
        p_author_id: authorId || null,
        p_limit: limit,
        p_offset: offset,
    };

    const { data, error } = await listDb.rpc("rpc__schematics_with_categories", rpcQuery);

    if (error) {
        BackendApiRouteLogger.error("Failed to fetch schematics", { error });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("获取原理图列表失败")
            .details({ error: error.message })
            .build();
    }

    let result = normalizeRpcSchematicsResult(data);
    if (result.total === 0) {
        try {
            result = await fetchSchematicsByTableFallback(listDb, {
                status: queryStatus,
                categoryId,
                authorId,
                limit,
                offset,
            });
        } catch (fallbackError) {
            BackendApiRouteLogger.error("Fallback fetch schematics failed", { error: fallbackError });
        }
    }

    const schematics = result?.schematics ?? [];
    const total = result?.total ?? 0;

    const allCategories = new Map<string, { id: string; name: string; slug: string }>();
    for (const schematic of schematics) {
        if (schematic.categories) {
            for (const cat of schematic.categories) {
                allCategories.set(cat.id, cat);
            }
        }
    }

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return new ApiResponse<Schematic.Schematic.SchematicListRes>()
        .code(ApiResponseCode.OK)
        .data({
            schematics: schematics.map((s) => ({
                id: s.id,
                author_id: s.author_id,
                name: s.name,
                description: s.description,
                status: s.status,
                format: s.format,
                mc_version: s.mc_version,
                tags: s.tags,
                file_url: s.file_url,
                images: s.images,
                upvotes: s.upvotes,
                starred: s.starred,
                viewed: s.viewed,
                created_at: s.created_at,
                updated_at: s.updated_at,
            })),
            categories: Array.from(allCategories.values()),
            total,
            page,
            page_size: limit,
            total_pages: totalPages,
        })
        .build();
}

export async function POST(request: Request): Promise<NextResponse<SchematicCreateResult>> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized create attempt", { error: authError });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    const { data: profile, error: profileError } = await supabaseServerAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    if (profileError) {
        BackendApiRouteLogger.error("Failed to fetch user profile", { error: profileError });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("用户资料不存在")
            .details({ error: `Error Code ${profileError.code}` })
            .build();
    }

    const userRole = profile?.role;
    if (userRole !== "creator" && userRole !== "admin") {
        return new ApiError()
            .code(ApiErrorCode.FORBIDDEN)
            .message("需要创作者或管理员权限")
            .build();
    }

    let body: Schematic.Schematic.CreateSchematicReq & { category_ids?: string[] };
    try {
        body = await request.json();
    } catch {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("无效的请求体")
            .build();
    }

    const parseResult = Schematic.Schematic.CreateSchematicReqSchema.safeParse(body);
    if (!parseResult.success) {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("请求参数验证失败")
            .details({ errors: parseResult.error.flatten() })
            .build();
    }

    const validatedData = parseResult.data;

    if (validatedData.status !== "draft" && validatedData.status !== "under_review") {
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("初始状态必须是 draft 或 under_review")
            .build();
    }

    const { data: newSchematic, error: insertError } = await supabaseServerAdmin
        .from("schematics")
        .insert({
            author_id: user.id,
            name: validatedData.name,
            description: validatedData.description ?? null,
            status: validatedData.status,
            format: validatedData.format,
            mc_version: validatedData.mc_version,
            tags: validatedData.tags ?? [],
            file_url: validatedData.file_url,
            images: validatedData.images ?? [],
        })
        .select()
        .single();

    if (insertError) {
        BackendApiRouteLogger.error("Failed to create schematic", { error: insertError });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("创建原理图失败")
            .details({ error: insertError.message })
            .build();
    }

    let categories: Array<{ id: string; name: string; slug: string }> = [];

    if (body.category_ids && body.category_ids.length > 0) {
        const { error: categoryError } = await supabaseServerAdmin.rpc("rpc__schematic_set_categories", {
            schematic_id: newSchematic.id,
            category_ids: body.category_ids,
        });

        if (categoryError) {
            BackendApiRouteLogger.warn("Failed to set categories for new schematic", {
                error: categoryError,
                schematic_id: newSchematic.id,
            });
        }

        const { data: categoryData } = await supabaseServerAdmin.rpc("rpc__schematic_get_categories", {
            schematic_id: newSchematic.id,
        });

        if (categoryData) {
            categories = categoryData.map((c: { id: string; name: string; slug: string }) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
            }));
        }
    }

    return new ApiResponse<Schematic.Schematic.SchematicRes>()
        .code(ApiResponseCode.CREATED)
        .data({
            schematic: {
                id: newSchematic.id,
                author_id: newSchematic.author_id,
                name: newSchematic.name,
                description: newSchematic.description,
                status: newSchematic.status,
                format: newSchematic.format,
                mc_version: newSchematic.mc_version,
                tags: newSchematic.tags,
                file_url: newSchematic.file_url,
                images: newSchematic.images,
                upvotes: newSchematic.upvotes,
                starred: newSchematic.starred,
                viewed: newSchematic.viewed,
                created_at: newSchematic.created_at,
                updated_at: newSchematic.updated_at,
            },
            categories,
        })
        .build();
}
