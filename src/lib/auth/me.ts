import { cookies } from "next/headers";

/**
 * 获取当前登录用户
 * @returns 当前登录用户
 */
export async function getUser() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST_URL}/api/account/me`, {
        headers: {
            cookie: (await cookies()).toString(), // 带上 session
        },
        cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
}