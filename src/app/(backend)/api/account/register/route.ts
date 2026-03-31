/**
 * @openapi
 * /api/account/register:
 *   post:
 *     summary: 用户注册
 *     description: 创建新用户账户并自动登录
 *     tags:
 *       - Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messageKey:
 *                   type: string
 *                   example: register_success
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 messageKey:
 *                   type: string
 *                   example: missing_fields
 *                 reason:
 *                   type: string
 *                   example: Email, password, and name are required
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 messageKey:
 *                   type: string
 *                   example: register_failed
 *                 reason:
 *                   type: string
 *                   example: Internal server error
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { DATABASE_ID, USERS_COLLECTION_ID, AccountStatus } from "@/lib/appwrite/constants";
import { BackendApiRouteLogger } from "@/lib/logger";
import { ID } from "node-appwrite";

type RegisterActionState = {
    success: boolean;
    messageKey: "missing_fields" | "email_invalid" | "password_short" | "register_success" | "register_failed" | "";
    reason?: string;
};

export async function POST(request: Request): Promise<NextResponse<RegisterActionState>> {
    try {
        const formData = await request.formData();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const name = String(formData.get("name") ?? "").trim();

        if (!email || !password || !name) {
            BackendApiRouteLogger.warn("Register request with missing fields", { email, name });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "missing_fields",
                    reason: "Email, password, and name are required",
                },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            BackendApiRouteLogger.warn("Register request with invalid email", { email });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "email_invalid",
                    reason: "Email is invalid",
                },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            BackendApiRouteLogger.warn("Register request with password shorter than 8 characters", { email });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "password_short",
                    reason: "Password must be at least 8 characters long",
                },
                { status: 400 }
            );
        }

        const { account, tablesDB, projectId, users } = createAdminClient();

        const user = await account.create({ userId: ID.unique(), email, password, name });

        try {
            await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: USERS_COLLECTION_ID,
                rowId: user.$id,
                data: {
                    account_status: AccountStatus.NORMAL,
                    uid: user.$id,
                },
            });
        } catch (error) {
            // Best-effort rollback: avoid leaving an auth account without a matching tablesDB row
            try {
                await users.delete(user.$id);
            } catch (rollbackError) {
                // If rollback fails, log and still surface the original error
                BackendApiRouteLogger.error("Failed to rollback orphaned user after tablesDB.createRow failure", {
                    userId: user.$id,
                    error: rollbackError,
                });
            }

            throw error;
        }

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

        BackendApiRouteLogger.info("Register request with success", { email, name });
        return NextResponse.json(
            {
                success: true,
                messageKey: "register_success",
            },
            { status: 201 }
        );
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : undefined;
        BackendApiRouteLogger.error("Register request failed", { errorMessage, err });
        return NextResponse.json(
            {
                success: false,
                messageKey: "register_failed",
                reason: "Internal server error",
            },
            { status: 500 }
        );
    }
}
