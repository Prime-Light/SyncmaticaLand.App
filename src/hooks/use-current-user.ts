"use client";

import { useEffect, useState } from "react";
import { Auth, WrapSchema } from "@/schema";

export type CurrentUser = Auth.Me.Me.Res["user"];

export interface UseCurrentUserResult {
    user: CurrentUser | null;
    /** 首次加载中（未提供 initialUser 时，请求 /api/v1/auth/me 期间为 true） */
    loading: boolean;
    /** 用于显示的首字母（A-Z 或 "U"） */
    userInitials: string;
    /** 强制重新获取用户数据 */
    refetch: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
    data: CurrentUser | null | undefined;
    timestamp: number;
    promise: Promise<WrapSchema<Auth.Me.Me.Res> | null> | null;
}

const cache: CacheEntry = {
    data: undefined,
    timestamp: 0,
    promise: null,
};

/**
 * 获取当前登录用户信息。
 *
 * - 若服务端已提供非空的 `initialUser`（真实用户对象），直接使用，跳过客户端请求
 * - `initialUser` 为 `null` 或 `undefined` 均视为"尚未获取"，优先读取内存缓存；
 *   缓存 miss 时调用 `/api/v1/auth/me`：401 视为未登录
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
    const [refetchToken, setRefetchToken] = useState(0);

    useEffect(() => {
        if (skip) return;
        if (initialUser != null) return;

        // 优先使用内存缓存（refetch 时跳过缓存）
        if (refetchToken === 0 && cache.data !== undefined && cache.data !== null && Date.now() - cache.timestamp < CACHE_TTL) {
            setUser(cache.data);
            setLoading(false);
            return;
        }

        // 去重：多个实例同时挂载时只发一次请求（refetch 时强制新建请求）
        if (refetchToken > 0 || !cache.promise) {
            cache.promise = fetch("/api/v1/auth/me", { method: "GET", cache: "no-store" })
                .then(async (res) => {
                    if (!res.ok) return null;
                    return (await res.json()) as WrapSchema<Auth.Me.Me.Res>;
                })
                .then((data: WrapSchema<Auth.Me.Me.Res> | null) => {
                    cache.data = data?.data?.user ?? null;
                    cache.timestamp = Date.now();
                    return data;
                })
                .catch(() => {
                    cache.data = null;
                    cache.timestamp = Date.now();
                    return null;
                })
                .finally(() => {
                    cache.promise = null;
                });
        }

        cache.promise.then((data) => {
            setUser(data?.data?.user ?? null);
            setLoading(false);
        });
    }, [initialUser, skip, refetchToken]);

    const userInitials =
        user?.display_name?.trim()?.[0]?.toUpperCase() ??
        user?.email?.trim()?.[0]?.toUpperCase() ??
        "U";

    const refetch = () => {
        cache.data = undefined;
        cache.timestamp = 0;
        cache.promise = null;
        setRefetchToken((prev) => prev + 1);
    };

    return { user, loading, userInitials, refetch };
}
