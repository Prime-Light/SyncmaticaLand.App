import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { ApiError, ApiErrorCode } from "@/lib/api-responses";
import { BackendApiRouteLogger } from "@/lib/logger";

async function checkDownloadPermission(
    schematic: { author_id: string; status: string },
    user: { id: string } | null,
    supabaseAdmin: typeof supabaseServerAdmin
): Promise<{ allowed: boolean; reason?: string }> {
    if (schematic.status === "published") {
        return { allowed: true };
    }

    if (!user) {
        return { allowed: false, reason: "未授权访问" };
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

    return { allowed: false, reason: "无权下载该文件" };
}

function sanitizeFilename(name: string): string {
    return name
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/\s+/g, "_")
        .slice(0, 100);
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const supabase = await createSupabaseServerClient();
    const { id: schematicId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: schematic, error: fetchError } = await supabaseServerAdmin
        .from("schematics")
        .select("id, name, file_url, author_id, status, format")
        .eq("id", schematicId)
        .single();

    if (fetchError || !schematic) {
        BackendApiRouteLogger.warn("Schematic not found for download", {
            error: fetchError,
            schematicId,
        });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("原理图不存在")
            .build();
    }

    if (!schematic.file_url) {
        BackendApiRouteLogger.warn("Schematic has no file_url", { schematicId });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("文件不存在")
            .build();
    }

    const permissionCheck = await checkDownloadPermission(schematic, user, supabaseServerAdmin);
    if (!permissionCheck.allowed) {
        return new ApiError()
            .code(ApiErrorCode.FORBIDDEN)
            .message(permissionCheck.reason ?? "无权下载")
            .build();
    }

    try {
        const res = await fetch(schematic.file_url, {
            redirect: "follow",
        });

        if (!res.ok || !res.body) {
            BackendApiRouteLogger.error("Upstream fetch failed", {
                file_url: schematic.file_url,
                status: res.status,
                schematicId,
            });

            return new ApiError()
                .code(ApiErrorCode.SERVER_ERROR)
                .message("文件下载失败")
                .build();
        }

        const sanitized = sanitizeFilename(schematic.name);
        const extension = schematic.format || "nbt";
        const filename = `${sanitized}.${extension}`;

        const headers = new Headers();
        headers.set(
            "Content-Type",
            res.headers.get("content-type") || "application/octet-stream"
        );
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Cache-Control", "private, max-age=3600");

        return new NextResponse(res.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        BackendApiRouteLogger.error("Download handler crashed", {
            error,
            schematicId,
        });

        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("下载失败")
            .build();
    }
}
