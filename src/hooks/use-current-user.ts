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

/**
 * 获取当前登录用户信息。
 *
 * - 若服务端已提供 `initialUser`，直接使用，跳过客户端请求
 * - 否则始终调用 `/api/v1/auth/me`：401 视为未登录，避免依赖
 *   `document.cookie` 字符串匹配（HttpOnly cookie 下不可读）
 */
export function useCurrentUser(initialUser?: CurrentUser | null): UseCurrentUserResult {
    const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);
    const [loading, setLoading] = useState(initialUser == null);

    useEffect(() => {
        // 若服务端已提供有效用户，同步 user 状态并跳过客户端请求
        if (initialUser !== undefined && initialUser !== null) {
            setUser(initialUser);
            return;
        }

        // 始终请求 API：以响应状态（401 = 未登录）为权威判断，
        // 不依赖 document.cookie（HttpOnly cookie 下无法读取）
        let mounted = true;
        setLoading(true);
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
