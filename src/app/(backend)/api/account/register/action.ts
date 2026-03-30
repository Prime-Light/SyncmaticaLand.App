"use server";

import { cookies } from "next/headers";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { DATABASE_ID, USERS_COLLECTION_ID, AccountStatus } from "@/lib/appwrite/constants";
import { BackendApiActionLogger } from "@/lib/logger";
import { ID } from "node-appwrite";

export type RegisterActionState = {
    success: boolean;
    messageKey: "missing_fields" | "email_invalid" | "password_short" | "register_success" | "register_failed" | "";
    reason?: string;
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
            reason: "Email, password, and name are required",
        };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        BackendApiActionLogger.warn("Register request with invalid email", { email });
        return {
            success: false,
            messageKey: "email_invalid",
            reason: "Email is invalid",
        };
    }

    if (password.length < 8) {
        BackendApiActionLogger.warn("Register request with password shorter than 8 characters", { password });
        return {
            success: false,
            messageKey: "password_short",
            reason: "Password must be at least 8 characters long",
        };
    }

    try {
        const { account, tablesDB, projectId } = createAdminClient();

        const user = await account.create({ userId: ID.unique(), email, password, name });

        await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: USERS_COLLECTION_ID,
            rowId: user.$id,
            data: {
                account_status: AccountStatus.NORMAL,
                uid: user.$id,
            },
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

        BackendApiActionLogger.info("Register request with success", { email, password, name });
        return {
            success: true,
            messageKey: "register_success",
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : undefined;
        BackendApiActionLogger.error("Register request failed", { errorMessage });
        return {
            success: false,
            messageKey: "register_failed",
            reason: errorMessage,
        };
    }
}
