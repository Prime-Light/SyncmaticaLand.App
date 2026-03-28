"use server";

import { cookies } from "next/headers";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { BackendApiActionLogger } from "@/lib/logger";

type LoginActionState = {
    success: boolean;
    messageKey: "missing_fields" | "login_success" | "login_failed" | "";
};

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        BackendApiActionLogger.warn("Login request with missing fields", { email, password });
        return {
            success: false,
            messageKey: "missing_fields",
        };
    }

    try {
        const { account, projectId } = createAdminClient();

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

        BackendApiActionLogger.info("Login success", { email });
        return {
            success: true,
            messageKey: "login_success",
        };
    } catch (err) {
        BackendApiActionLogger.error("Login failed", { err });
        return {
            success: false,
            messageKey: "login_failed",
        };
    }
}
