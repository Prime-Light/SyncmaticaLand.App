/**
 * @openapi
 * /api/account/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取已登录用户的详细信息
 *     tags:
 *       - Account
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 66d5b45e3d55c0001f40c78b
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     emailVerification:
 *                       type: boolean
 *                       example: true
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   example: null
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (!sessionSecret) {
            return NextResponse.json({ user: null }, { status: 404 });
        }

        const { account } = createSessionClient(sessionSecret);
        const user = await account.get();

        return NextResponse.json(
            {
                user: {
                    id: user.$id,
                    name: user.name,
                    email: user.email,
                    emailVerification: user.emailVerification,
                    labels: user.labels,
                },
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
