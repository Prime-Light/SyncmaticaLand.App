import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database/server";
import { BackendApiRouteLogger } from "@/lib/logger";
import { ApiResponse, ApiError, ApiErrorCode, ApiResponseCode } from "@/lib/api-responses";
import { Auth, WrapSchema } from "@/schema";
import { IApiErrorResponse } from "@/types/api-error";

export type MeResult = WrapSchema<Auth.Me.Me.Res> | IApiErrorResponse;

export async function GET(): Promise<NextResponse<MeResult>> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        BackendApiRouteLogger.warn("Failed to get current user", { error: authError });
        return new ApiError()
            .code(ApiErrorCode.UNAUTHORIZED)
            .message("未授权访问")
            .details({ error: authError?.message ?? "No user session found" })
            .build();
    }

    const { data: profile, error: profileError } = await supabaseServerAdmin
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("user_id", user.id)
        .single();

    if (profileError) {
        BackendApiRouteLogger.error("Failed to fetch user profile", { error: profileError });
        return new ApiError()
            .code(ApiErrorCode.NOT_FOUND)
            .message("用户资料不存在")
            .details({ error: `Error Code ${profileError.code}` })
            .build();
    }

    return new ApiResponse<Auth.Me.Me.Res>()
        .code(ApiResponseCode.OK)
        .data({
            user: {
                user_id: user.id,
                email: user.email ?? "",
                display_name: profile?.display_name ?? "",
                avatar_url: profile?.avatar_url ?? "",
                role: profile?.role ?? "user",
            },
        })
        .build();
}
