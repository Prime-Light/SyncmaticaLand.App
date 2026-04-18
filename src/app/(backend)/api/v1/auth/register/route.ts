import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type RegisterResult = WrapSchema<Auth.Register.Register.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<RegisterResult>> {
    const parseResult = await parseBody(req, Auth.Register.Register.ReqSchema);
    if (!parseResult.success) {
        return parseResult.error;
    }
    const body = parseResult.body;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
            emailRedirectTo:
                body.redirect_url ||
                `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to register user", { error });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("注册失败")
            .details({ error: error.message })
            .build();
    }

    if (!data.user) {
        BackendApiRouteLogger.error("Failed to register user: no user returned");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("注册失败")
            .details({ error: "Failed to create user" })
            .build();
    }

    const { error: profileError } = await supabaseServerAdmin.from("profiles").insert({
        user_id: data.user.id,
        display_name: body.display_name,
    });

    if (profileError) {
        BackendApiRouteLogger.error("Failed to create user profile", {
            error: profileError,
        });

        const { error: deleteError } = await supabaseServerAdmin.auth.admin.deleteUser(
            data.user.id
        );

        if (deleteError) {
            BackendApiRouteLogger.error(
                "[CAUTION!] Failed to delete user during rollback. This will result in inconsistent data.",
                {
                    error: deleteError,
                }
            );
        }

        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("注册失败")
            .details({ error: `Error Code ${profileError.code}` })
            .build();
    }

    return new ApiResponse<Auth.Register.Register.Res>()
        .code(ApiResponseCode.CREATED)
        .data({
            user_id: data.user.id,
            email: body.email,
            message: "验证邮件已发送，请检查邮箱",
        })
        .build();
}
