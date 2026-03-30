/**
 * @openapi
 * /api/account/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录用户账户
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
 *     responses:
 *       200:
 *         description: 登录成功
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
 *                   example: login_success
 *       400:
 *         description: 请求参数缺失
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
 *                   example: Email or password is missing
 *       401:
 *         description: 登录失败
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
 *                   example: invalid_credentials
 *                 reason:
 *                   type: string
 *                   example: Invalid email or password
 *       403:
 *         description: 账户已被封禁
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
 *                   example: account_banned
 *                 reason:
 *                   type: string
 *                   example: Your account has been banned
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
 *                   example: login_failed
 *                 reason:
 *                   type: string
 *                   example: Internal server error
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient, createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";
import { DATABASE_ID, USERS_COLLECTION_ID, AccountStatus, UserDocument } from "@/lib/appwrite/constants";
import { BackendApiRouteLogger } from "@/lib/logger";
import { Models } from "node-appwrite";

type LoginActionState = {
    success: boolean;
    messageKey: "missing_fields" | "login_success" | "login_failed" | "invalid_credentials" | "account_banned" | "";
    reason?: string;
};

export async function POST(request: Request): Promise<NextResponse<LoginActionState>> {
    try {
        const formData = await request.formData();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!email || !password) {
            BackendApiRouteLogger.warn("Login request with missing fields", { email, password });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "missing_fields",
                    reason: "Email or password is missing",
                },
                { status: 400 }
            );
        }

        const { account, tablesDB, projectId } = createAdminClient();

        let session: Models.Session;
        try {
            session = await account.createEmailPasswordSession({ email, password });
        } catch (err) {
            if (err instanceof Error && err.message.includes("Invalid credentials")) {
                return NextResponse.json(
                    {
                        success: false,
                        messageKey: "invalid_credentials",
                        reason: err.message,
                    },
                    { status: 401 }
                );
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
                await sessionAccount.deleteSession({ sessionId: session.$id });
                BackendApiRouteLogger.warn("Login attempt by banned user", { email, userId: session.userId });
                return NextResponse.json(
                    {
                        success: false,
                        messageKey: "account_banned",
                        reason: userDoc.banned_reason || "Your account has been banned",
                    },
                    { status: 403 }
                );
            }
        } catch (err) {
            BackendApiRouteLogger.warn("Failed to check user status, allowing login", { userId: session.userId, err });
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

        BackendApiRouteLogger.info("Login success", { email });
        return NextResponse.json(
            {
                success: true,
                messageKey: "login_success",
            },
            { status: 200 }
        );
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : undefined;
        BackendApiRouteLogger.error("Login failed", { errorMessage });

        return NextResponse.json(
            {
                success: false,
                messageKey: "login_failed",
                reason: errorMessage,
            },
            { status: 500 }
        );
    }
}
