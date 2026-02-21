"use server";
import { ID } from "node-appwrite";
import { cookies, headers } from "next/headers";
import { createAdminClient, createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";

export type SignupActionState = {
    success: boolean;
    messageKey: "missing_fields" | "signup_success" | "signup_failed" | "";
};

export async function signupAction(_prevState: SignupActionState, formData: FormData): Promise<SignupActionState> {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
        return {
            success: false,
            messageKey: "missing_fields",
        };
    }

    try {
        const { users, account, projectId } = createAdminClient();

        await users.create({
            userId: ID.unique(),
            name,
            email,
            password,
        });

        const session = await account.createEmailPasswordSession({ email, password });
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName(projectId);

        cookieStore.set(sessionCookieName, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(session.expire),
        });

        const headerStore = await headers();
        const origin = headerStore.get("origin");
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin ?? "http://localhost:3000";
        const verificationUrl = `${baseUrl}/api/auth/verify-email`;
        const { account: sessionAccount } = createSessionClient(session.secret);
        await sessionAccount.createEmailVerification({ url: verificationUrl });

        return {
            success: true,
            messageKey: "signup_success",
        };
    } catch {
        return {
            success: false,
            messageKey: "signup_failed",
        };
    }
}
