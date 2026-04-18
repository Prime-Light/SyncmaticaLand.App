import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database";
import { BackendApiRouteLogger } from "@/lib/logger";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import {
    uploadSchematicFile,
    MAX_SCHEMATIC_SIZE,
    ACCEPTED_SCHEMATIC_TYPES,
} from "@/lib/storage";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type UploadResult = { data: Schematic.Upload.UploadRes } | IApiErrorResponse;

export async function POST(request: Request): Promise<NextResponse<UploadResult>> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Unauthorized upload attempt", { error: authError });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        BackendApiRouteLogger.warn("Failed to parse form data");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("无法解析表单数据")
            .build();
    }

    const file = formData.get("file") as File | null;

    if (!file) {
        BackendApiRouteLogger.warn("No file provided in upload request");
        return new ApiError().code(ApiErrorCode.BAD_REQUEST).message("未提供文件").build();
    }

    if (file.size > MAX_SCHEMATIC_SIZE) {
        BackendApiRouteLogger.warn("File size exceeds limit", {
            fileSize: file.size,
            maxSize: MAX_SCHEMATIC_SIZE,
        });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("文件大小超出限制")
            .details({ maxSize: `${MAX_SCHEMATIC_SIZE / 1024 / 1024}MB` })
            .build();
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_SCHEMATIC_TYPES.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
        BackendApiRouteLogger.warn("Invalid file type", {
            fileName: file.name,
            acceptedTypes: ACCEPTED_SCHEMATIC_TYPES,
        });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("不支持的文件类型")
            .details({ acceptedTypes: ACCEPTED_SCHEMATIC_TYPES.join(", ") })
            .build();
    }

    const { url, error: uploadError } = await uploadSchematicFile(file, user.id, file.name);

    if (uploadError) {
        BackendApiRouteLogger.error("Failed to upload schematic file", { error: uploadError });
        return new ApiError()
            .code(ApiErrorCode.SERVER_ERROR)
            .message("文件上传失败")
            .details({ error: uploadError.message })
            .build();
    }

    BackendApiRouteLogger.info("Schematic file uploaded successfully", {
        userId: user.id,
        fileName: file.name,
        fileUrl: url,
    });

    return new ApiResponse<Schematic.Upload.UploadRes>()
        .code(ApiResponseCode.CREATED)
        .data({
            file_url: url,
            file_name: file.name,
            file_size: file.size,
        })
        .build();
}
