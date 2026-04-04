import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database/client";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth } from "@/schema";
import { ApiErrorCode, IApiErrorResponse } from "@/types/api-error";

export type VerifyResult = Auth.Register.Verify.Res | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<VerifyResult>> {
    const body = await parseBody(req, Auth.Register.Verify.ReqSchema);

    const { data, error } = await supabaseClient.auth.verifyOtp({
        email: body.email,
        token: body.token,
        type: "signup",
        options: {
            redirectTo: body.redirect_url || `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to verify OTP", { error });
        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "验证失败",
                details: { error: error.message },
            },
        });
    }

    if (!data.user) {
        BackendApiRouteLogger.error("Failed to verify OTP: no user returned");
        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "验证失败",
                details: { error: "用户验证失败" },
            },
        });
    }

    return NextResponse.json({
        data: {
            user_id: data.user.id,
            email: body.email,
            message: "邮箱验证成功",
        },
    });
}
