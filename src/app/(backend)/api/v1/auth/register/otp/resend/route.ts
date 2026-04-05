import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database/client";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";
import { ApiError, ApiErrorCode, ApiResponse } from "@/lib/api-responses";

export type ResendResult = WrapSchema<Auth.Register.Resend.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<ResendResult>> {
    const body = await parseBody(req, Auth.Register.Resend.ReqSchema);

    const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email: body.email,
        options: {
            emailRedirectTo: body.redirect_url || `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to resend verification email", { error });
        return new ApiError().code(ApiErrorCode.BAD_REQUEST).message("发送失败").details({ error: error.message }).build();
    }

    return new ApiResponse<Auth.Register.Resend.Res>()
        .data({
            email: body.email,
            message: "验证邮件已发送，请检查邮箱",
        })
        .build();
}
