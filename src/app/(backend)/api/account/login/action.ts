"use server";

import { cookies } from "next/headers";
import { createAdminClient, createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";
import { DATABASE_ID, USERS_COLLECTION_ID, AccountStatus, UserDocument } from "@/lib/appwrite/constants";
import { BackendApiActionLogger } from "@/lib/logger";
import { Models } from "node-appwrite";

export type LoginActionState = {
    success: boolean;
    messageKey: "missing_fields" | "login_success" | "login_failed" | "invalid_credentials" | "account_banned" | "";
    reason?: string;
};

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        BackendApiActionLogger.warn("Login request with missing fields", { email, password });
        return {
            success: false,
            messageKey: "missing_fields",
            reason: "Email or password is missing",
        };
    }

    try {
        const { account, tablesDB, projectId } = createAdminClient();

        let session: Models.Session;
        try {
            session = await account.createEmailPasswordSession({ email, password });
        } catch (err) {
            if (err instanceof Error && err.message.includes("Invalid credentials")) {
                return {
                    success: false,
                    messageKey: "invalid_credentials",
                    reason: err.message,
                };
            } else {
                throw err;
            }
        }

        try {
            const userDoc = await tablesDB.getRow<UserDocument>({
                databaseId: DATABASE_ID,
                tableId: USERS_COLLECTION_ID,
                rowId: session.userId,
            });

            if (userDoc.account_status === AccountStatus.BANNED) {
                const { account: sessionAccount } = createSessionClient(session.secret);
                await sessionAccount.deleteSession({ sessionId: "current" });
                BackendApiActionLogger.warn("Login attempt by banned user", { email, userId: session.userId });
                return {
                    success: false,
                    messageKey: "account_banned",
                    reason: userDoc.banned_reason || "Your account has been banned",
                };
            }
        } catch (err) {
            BackendApiActionLogger.error("Failed to check user status, allowing login", { userId: session.userId, err }, true);
        }

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
        const errorMessage = err instanceof Error ? err.message : undefined;
        BackendApiActionLogger.error("Login failed", { errorMessage, err }, true);
        return {
            success: false,
            messageKey: "login_failed",
            reason: errorMessage,
        };
    }
}
