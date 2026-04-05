import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type LoginResult = WrapSchema<Auth.Login.Login.Res> | IApiErrorResponse;

export async function POST(req: NextRequest): Promise<NextResponse<LoginResult>> {
    const parseResult = await parseBody(req, Auth.Login.Login.ReqSchema);
    if (!parseResult.success) {
        return parseResult.error;
    }
    const body = parseResult.body;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
    });

    if (error) {
        BackendApiRouteLogger.error("Failed to login", { error });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("登录失败")
            .details({ error: error.message })
            .build();
    }

    if (!data.user || !data.session) {
        BackendApiRouteLogger.error("Failed to login: no user or session returned");
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("登录失败")
            .details({ error: "Invalid credentials" })
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

    return new ApiResponse<Auth.Login.Login.Res>()
        .code(ApiResponseCode.OK)
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
        })
        .build();
}
