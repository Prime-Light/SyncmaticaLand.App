import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";
import { ApiError, ApiErrorCode, ApiResponse } from "@/lib/api-responses";

export type VerifyResult = WrapSchema<Auth.Login.Verify.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<VerifyResult>> {
    const parseResult = await parseBody(req, Auth.Login.Verify.ReqSchema);
    if (!parseResult.success) {
        return parseResult.error;
    }
    const body = parseResult.body;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
        email: body.email,
        token: body.token,
        type: "magiclink",
        options: {
            redirectTo:
                body.redirect_url ||
                `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to verify login OTP", { error });
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("验证失败")
            .details({ error: error.message })
            .build();
    }

    if (!data.user || !data.session) {
        BackendApiRouteLogger.error("Failed to verify login OTP: no user or session returned");
        return new ApiError()
            .code(ApiErrorCode.BAD_REQUEST)
            .message("验证失败")
            .details({ error: "登录验证失败" })
            .build();
    }

    const { data: profile, error: profileError } = await supabaseServerAdmin
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("user_id", data.user.id)
        .single();

    if (profileError) {
        BackendApiRouteLogger.error("Failed to fetch user profile", { error: profileError });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("用户资料不存在")
            .details({ error: `Error Code ${profileError.code}` })
            .build();
    }

    return new ApiResponse<Auth.Login.Verify.Res>()
        .data({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
            token_type: "Bearer",
            user: {
                user_id: data.user.id,
                email: data.user.email ?? body.email,
                display_name: profile?.display_name ?? "",
                avatar_url: profile?.avatar_url ?? "",
                role: profile?.role ?? "user",
            },
            message: "登录成功",
        })
        .build();
}
