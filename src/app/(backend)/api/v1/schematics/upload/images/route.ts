import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/database";
import { BackendApiRouteLogger } from "@/lib/logger";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import {
    uploadImageFile,
    MAX_IMAGE_SIZE,
    ACCEPTED_IMAGE_TYPES,
} from "@/lib/storage";
import { Schematic } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

const MAX_FILES = 5;

export type MultiUploadResult = { data: Schematic.Upload.MultiUploadRes } | IApiErrorResponse;

export async function POST(request: Request): Promise<NextResponse<MultiUploadResult>> {
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

    const schematicId = formData.get("schematic_id") as string | null;

    if (!schematicId) {
        BackendApiRouteLogger.warn("No schematic_id provided in upload request");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("未提供 schematic_id")
            .build();
    }

    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
        BackendApiRouteLogger.warn("No files provided in upload request");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("未提供文件")
            .build();
    }

    if (files.length > MAX_FILES) {
        BackendApiRouteLogger.warn("Too many files in upload request", {
            fileCount: files.length,
            maxFiles: MAX_FILES,
        });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("文件数量超出限制")
            .details({ maxFiles: MAX_FILES })
            .build();
    }

    for (const file of files) {
        if (file.size > MAX_IMAGE_SIZE) {
            BackendApiRouteLogger.warn("File size exceeds limit", {
                fileName: file.name,
                fileSize: file.size,
                maxSize: MAX_IMAGE_SIZE,
            });
            return new ApiError()
                .code(ApiErrorCode.BAD_REQUEST)
                .message("文件大小超出限制")
                .details({
                    fileName: file.name,
                    maxSize: `${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
                })
                .build();
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            BackendApiRouteLogger.warn("Invalid file type", {
                fileName: file.name,
                fileType: file.type,
                acceptedTypes: ACCEPTED_IMAGE_TYPES,
            });
            return new ApiError()
                .code(ApiErrorCode.BAD_REQUEST)
                .message("不支持的文件类型")
                .details({
                    fileName: file.name,
                    acceptedTypes: ACCEPTED_IMAGE_TYPES.join(", "),
                })
                .build();
        }
    }

    const uploadResults: Schematic.Upload.UploadRes[] = [];
    let totalSize = 0;

    for (const file of files) {
        const { url, error: uploadError } = await uploadImageFile(
            file,
            user.id,
            schematicId,
            file.name
        );

        if (uploadError) {
            BackendApiRouteLogger.error("Failed to upload image file", {
                error: uploadError,
                fileName: file.name,
            });
            return new ApiError()
                .code(ApiErrorCode.SERVER_ERROR)
                .message("文件上传失败")
                .details({ fileName: file.name, error: uploadError.message })
                .build();
        }

        uploadResults.push({
            file_url: url,
            file_name: file.name,
            file_size: file.size,
        });
        totalSize += file.size;
    }

    BackendApiRouteLogger.info("Image files uploaded successfully", {
        userId: user.id,
        schematicId,
        fileCount: files.length,
        totalSize,
    });

    return new ApiResponse<Schematic.Upload.MultiUploadRes>()
        .code(ApiResponseCode.CREATED)
        .data({
            files: uploadResults,
            total_size: totalSize,
        })
        .build();
}
