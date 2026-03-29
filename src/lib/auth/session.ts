"use server";

import { cookies } from "next/headers";
import { createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";

export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (sessionSecret) {
            const { account } = createSessionClient(sessionSecret);
            await account.deleteSession({ sessionId: "current" });
        }

        cookieStore.delete(sessionCookieName);
        return { success: true };
    } catch {
        return { success: false };
    }
}

export async function resendEmailVerificationAction() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (!sessionSecret) {
            return { success: false };
        }

        const { account } = createSessionClient(sessionSecret);
        await account.createVerification({ url: `${process.env.NEXT_PUBLIC_HOST_URL}/api/account/verify-email` });

        return { success: true };
    } catch {
        return { success: false };
    }
}
