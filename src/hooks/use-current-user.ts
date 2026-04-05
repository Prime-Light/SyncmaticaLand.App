"use client";

import { useEffect, useState } from "react";
import { Auth, WrapSchema } from "@/schema";

export type CurrentUser = Auth.Me.Me.Res["user"];

export interface UseCurrentUserResult {
    user: CurrentUser | null;
    /** 首次加载中 */
    loading: boolean;
    /** 用于显示的首字母（A-Z 或 "U"） */
    userInitials: string;
}

/**
 * 获取当前登录用户信息。
 *
 * 调用 `/api/v1/auth/me` 接口，适用于导航栏、侧边栏等各处通用场景。
 * 未登录或请求失败时 `user` 为 `null`。
 */
export function useCurrentUser(initialUser?: CurrentUser | null): UseCurrentUserResult {
    const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);
    const [loading, setLoading] = useState(initialUser === undefined);

    useEffect(() => {
        let mounted = true;
        fetch("/api/v1/auth/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                return (await res.json()) as WrapSchema<Auth.Me.Me.Res>;
            })
            .then((data) => {
                if (!mounted) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setUser((data as any)?.data?.user ?? null);
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
    }, []);

    const userInitials =
        user?.display_name?.trim()?.[0]?.toUpperCase() ??
        user?.email?.trim()?.[0]?.toUpperCase() ??
        "U";

    return { user, loading, userInitials };
}
