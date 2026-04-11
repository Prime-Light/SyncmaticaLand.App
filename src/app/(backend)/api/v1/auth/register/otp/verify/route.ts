import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";
import { ApiError, ApiErrorCode, ApiResponse } from "@/lib/api-responses";

export type VerifyResult = WrapSchema<Auth.Register.Verify.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<VerifyResult>> {
    const parseResult = await parseBody(req, Auth.Register.Verify.ReqSchema);
    if (!parseResult.success) {
        return parseResult.error;
    }
    const body = parseResult.body;

    const { data, error } = await supabaseClient.auth.verifyOtp({
        email: body.email,
        token: body.token,
        type: "signup",
        options: {
            redirectTo:
                body.redirect_url ||
                `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to verify OTP", { error });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("验证失败")
            .details({ error: error.message })
            .build();
    }

    if (!data.user) {
        BackendApiRouteLogger.error("Failed to verify OTP: no user returned");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("验证失败")
            .details({ error: "用户验证失败" })
            .build();
    }

    return new ApiResponse<Auth.Register.Verify.Res>()
        .data({
            user_id: data.user.id,
            email: body.email,
            message: "邮箱验证成功",
        })
        .build();
}
