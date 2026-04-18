"use client";

import { useEffect, useState, useRef } from "react";
import { Auth, WrapSchema } from "@/schema";

export type CurrentUser = Auth.Me.Me.Res["user"];

export interface UseCurrentUserResult {
    user: CurrentUser | null;
    /** 首次加载中（未提供 initialUser 时，请求 /api/v1/auth/me 期间为 true） */
    loading: boolean;
    /** 用于显示的首字母（A-Z 或 "U"） */
    userInitials: string;
}

/**
 * 获取当前登录用户信息。
 *
 * - 若服务端已提供非空的 `initialUser`（真实用户对象），直接使用，跳过客户端请求
 * - `initialUser` 为 `null` 或 `undefined` 均视为"尚未获取"，始终调用
 *   `/api/v1/auth/me`：401 视为未登录，避免依赖 `document.cookie`
 *   字符串匹配（HttpOnly cookie 下不可读）
 * - 当 `skip` 为 `true` 时，不发起任何请求，直接以 `null` 作为用户状态
 *   （适用于服务端已明确知道用户未认证的场景）
 */
export function useCurrentUser(
    initialUser?: CurrentUser | null,
    { skip = false }: { skip?: boolean } = {}
): UseCurrentUserResult {
    const [user, setUser] = useState<CurrentUser | null>(() => {
        if (skip) return null;
        return initialUser ?? null;
    });
    const [loading, setLoading] = useState(() => {
        if (skip) return false;
        return initialUser == null;
    });
    const hasFetched = useRef(false);

    useEffect(() => {
        if (skip) return;

        if (initialUser != null) return;

        if (hasFetched.current) return;
        hasFetched.current = true;

        let mounted = true;
        fetch("/api/v1/auth/me", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) return null;
                return (await res.json()) as WrapSchema<Auth.Me.Me.Res>;
            })
            .then((data: WrapSchema<Auth.Me.Me.Res> | null) => {
                if (!mounted) return;
                setUser(data?.data?.user ?? null);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [initialUser, skip]);

    const userInitials =
        user?.display_name?.trim()?.[0]?.toUpperCase() ??
        user?.email?.trim()?.[0]?.toUpperCase() ??
        "U";

    return { user, loading, userInitials };
}
