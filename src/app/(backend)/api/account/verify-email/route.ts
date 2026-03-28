/**
 * @openapi
 * /api/account/verify-email:
 *   get:
 *     summary: 邮箱验证
 *     description: 使用用户ID和验证密钥验证用户邮箱
 *     tags:
 *       - Account
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 66d5b45e3d55c0001f40c78b
 *         description: 用户ID
 *       - in: query
 *         name: secret
 *         required: true
 *         schema:
 *           type: string
 *           example: verification-secret-123
 *         description: 验证密钥
 *     responses:
 *       302:
 *         description: 重定向到首页，附带验证结果
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: /?verify=success
 *             description: 重定向地址
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { BackendApiRouteLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
        BackendApiRouteLogger.error("No userId or secret!");
        return NextResponse.redirect(new URL("/?verify=failed", request.url));
    }

    try {
        const { account } = createAdminClient();
        await account.updateVerification({ userId, secret });
        return NextResponse.redirect(new URL("/?verify=success", request.url));
    } catch (error) {
        BackendApiRouteLogger.error("Verify email failed", { error });
        return NextResponse.redirect(new URL("/?verify=failed", request.url));
    }
}
