// lib/auth/register.ts
import { supabaseClient } from "@/lib/database/client";
import { supabaseServer } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { safelyGetEnv } from "@/lib/utils";
import { Auth } from "@/schema";
import { ApiErrorCode, IApiErrorResponse } from "@/types/api-error";

export type RegisterResult = Auth.Register.Res | IApiErrorResponse;

/**
 * @des
 * 核心用户注册逻辑（包含 Supabase 注册 + profiles 表插入 + 失败回滚）\
 * 可同时被 API Route 和 Server Action 调用
 */
export async function registerUser(body: Auth.Register.Req): Promise<RegisterResult> {
    // 1. 执行 Supabase 注册
    const { data, error } = await supabaseClient.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
            emailRedirectTo: body.redirect_url || `${safelyGetEnv("NEXT_PUBLIC_HOST_URL")}/auth/verify/callback`,
        },
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to register user", { error });
        return {
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: error.message },
            },
        };
    }

    if (!data.user) {
        BackendApiRouteLogger.error("Failed to register user: no user returned");
        return {
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: "用户创建失败" },
            },
        };
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

        return {
            error: {
                code: ApiErrorCode.BAD_REQUEST,
                message: "注册失败",
                details: { error: profileError.message },
            },
        };
    }

    // 3. 注册成功
    return {
        data: {
            user_id: data.user.id,
            email: body.email,
            message: "验证邮件已发送，请检查邮箱",
        },
    };
}
