import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/database/client";
import { supabaseServer } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { safelyGetEnv } from "@/lib/utils";
import { Auth } from "@/schema";
import { ApiErrorCode, IApiErrorResponse } from "@/types/api-error";

export type RegisterResult = Auth.Register.Register.Res | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<Auth.Register.Register.Res | IApiErrorResponse>> {
    const body = await parseBody(req, Auth.Register.Register.ReqSchema);

    const { data, error } = await supabaseClient.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
            emailRedirectTo: body.redirect_url || `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to register user", { error });
        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: error.message },
            },
        });
    }

    if (!data.user) {
        BackendApiRouteLogger.error("Failed to register user: no user returned");
        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: "用户创建失败" },
            },
        });
    }

    // 2. 创建用户 profile
    const { error: profileError } = await supabaseServer.from("profiles").insert({
        user_id: data.user.id,
        display_name: body.display_name,
    });

    if (profileError) {
        BackendApiRouteLogger.error("Failed to create user profile", {
            error: profileError,
        });

        // 回滚：删除已创建的 auth 用户
        const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(data.user.id);

        if (deleteError) {
            BackendApiRouteLogger.error("[CAUTION] Failed to delete user during rollback", {
                error: deleteError,
            });
        }

        return NextResponse.json({
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: profileError.message },
            },
        });
    }

    // 3. 注册成功
    return NextResponse.json({
        data: {
            user_id: data.user.id,
            email: body.email,
            message: "验证邮件已发送，请检查邮箱",
        },
    });
}
