import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database/client";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth } from "@/schema";
import { ApiErrorCode, IApiErrorResponse } from "@/types/api-error";

export type ResendResult = Auth.Register.Resend.Res | IApiErrorResponse;

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
        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "发送失败",
                details: { error: error.message },
            },
        });
    }

    return NextResponse.json({
        data: {
            email: body.email,
            message: "验证邮件已发送，请检查邮箱",
        },
    });
}
