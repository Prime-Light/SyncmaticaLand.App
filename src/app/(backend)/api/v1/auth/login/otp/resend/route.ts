import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database/client";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";
import { ApiError, ApiErrorCode, ApiResponse } from "@/lib/api-responses";

export type ResendResult = WrapSchema<Auth.Login.Resend.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<ResendResult>> {
    const parseResult = await parseBody(req, Auth.Login.Resend.ReqSchema);
    if (!parseResult.success) {
        return parseResult.error;
    }
    const body = parseResult.body;

    const { error } = await supabaseClient.auth.signInWithOtp({
        email: body.email,
        options: {
            emailRedirectTo:
                body.redirect_url ||
                `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
            shouldCreateUser: false,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to send login OTP", { error });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("发送验证码失败")
            .details({ error: error.message })
            .build();
    }

    return new ApiResponse<Auth.Login.Resend.Res>()
        .data({
            email: body.email,
            message: "登录验证码已发送，请检查邮箱",
        })
        .build();
}
