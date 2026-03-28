"use server";

import { cookies } from "next/headers";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { BackendApiActionLogger } from "@/lib/logger";

type RegisterActionState = {
    success: boolean;
    messageKey: "missing_fields" | "email_invalid" | "password_short" | "register_success" | "register_failed" | "";
};

export async function registerAction(_prevState: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    if (!email || !password || !name) {
        BackendApiActionLogger.warn("Register request with missing fields", { email, password, name });
        return {
            success: false,
            messageKey: "missing_fields",
        };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        BackendApiActionLogger.warn("Register request with invalid email", { email });
        return {
            success: false,
            messageKey: "email_invalid",
        };
    }

    if (password.length < 8) {
        BackendApiActionLogger.warn("Register request with password shorter than 8 characters", { password });
        return {
            success: false,
            messageKey: "password_short",
        };
    }

    try {
        const { account, projectId } = createAdminClient();

        /* const user = */ await account.create({ userId: "unique()", email, password, name });

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

        BackendApiActionLogger.info("Register request with success", { email, password, name });
        return {
            success: true,
            messageKey: "register_success",
        };
    } catch (err) {
        BackendApiActionLogger.error("Register request failed", { err });
        return {
            success: false,
            messageKey: "register_failed",
        };
    }
}
