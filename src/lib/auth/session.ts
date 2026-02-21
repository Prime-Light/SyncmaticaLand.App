"use server";

import { cookies } from "next/headers";
import { createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (!sessionSecret) {
            return null;
        }

        const { account } = createSessionClient(sessionSecret);
        return await account.get();
    } catch {
        return null;
    }
}

export async function logoutAction() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (sessionSecret) {
            try {
                const { account } = createSessionClient(sessionSecret);
                await account.deleteSession({ sessionId: "current" });
            } catch {
                // Ignore upstream session revoke errors and still clear local cookie.
            }
        }

        cookieStore.delete(sessionCookieName);
    } catch {}
}

export async function resendEmailVerificationAction() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (!sessionSecret) {
            return { success: false };
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const verificationUrl = `${baseUrl}/api/auth/verify-email`;
        const { account } = createSessionClient(sessionSecret);
        await account.createEmailVerification({ url: verificationUrl });

        return { success: true };
    } catch (err) {
        console.debug('[ERR] Caught unexcepted error in "session.ts" while resending verify email: \n' + err);
        return { success: false };
    }
}
