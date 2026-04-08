"use client";

import { useEffect, useState } from "react";
import { Auth, WrapSchema } from "@/schema";

export type CurrentUser = Auth.Me.Me.Res["user"];

export interface UseCurrentUserResult {
    user: CurrentUser | null;
    /** 首次加载中（仅当检测到本地 token 时为 true） */
    loading: boolean;
    /** 用于显示的首字母（A-Z 或 "U"） */
    userInitials: string;
}

/** 检测浏览器本地是否存在 Supabase auth token cookie */
function hasLocalAuthToken(): boolean {
    if (typeof document === "undefined") return false;
    return /sb-[^=\s]+-auth-token/.test(document.cookie);
}

/**
 * 获取当前登录用户信息。
 *
 * - 本地有 token → loading = true，调用 `/api/v1/auth/me` 验证后更新
 * - 本地无 token → loading = false，直接返回 user = null（跳过 API 请求）
 */
export function useCurrentUser(initialUser?: CurrentUser | null): UseCurrentUserResult {
    const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 若服务端已提供有效用户，同步 user 状态并跳过客户端请求
        if (initialUser !== undefined && initialUser !== null) {
            setUser(initialUser);
            return;
        }

        // 未检测到本地 token，直接视为未登录
        if (!hasLocalAuthToken()) {
            setUser(null);
            return;
        }

        // 检测到 token，请求 API 验证
        setLoading(true);
        let mounted = true;
        fetch("/api/v1/auth/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                return (await res.json()) as WrapSchema<Auth.Me.Me.Res>;
            })
            .then((data: WrapSchema<Auth.Me.Me.Res> | null) => {
                if (!mounted) return;
                setUser(data?.data?.user ?? null);
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [initialUser]);

    const userInitials =
        user?.display_name?.trim()?.[0]?.toUpperCase() ??
        user?.email?.trim()?.[0]?.toUpperCase() ??
        "U";

    return { user, loading, userInitials };
}
