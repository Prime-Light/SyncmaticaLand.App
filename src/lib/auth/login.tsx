"use server";

import { Account, Client } from "node-appwrite";
import { cookies } from "next/headers";

const APPWRITE_SESSION_COOKIE = "appwrite-session";

type LoginActionState = {
    success: boolean;
    messageKey: "missing_fields" | "login_success" | "login_failed" | "";
};

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        return {
            success: false,
            messageKey: "missing_fields",
        };
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !projectId) {
        return {
            success: false,
            messageKey: "login_failed",
        };
    }

    try {
        const client = new Client().setEndpoint(endpoint).setProject(projectId);
        const account = new Account(client);

        const session = await account.createEmailPasswordSession(email, password);
        const cookieStore = await cookies();

        cookieStore.set(APPWRITE_SESSION_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        return {
            success: true,
            messageKey: "login_success",
        };
    } catch {
        return {
            success: false,
            messageKey: "login_failed",
        };
    }
}
