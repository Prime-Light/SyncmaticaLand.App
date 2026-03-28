import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { BackendApiRouteLogger } from "@/lib/logger";

type LoginActionState = {
    success: boolean;
    messageKey: "missing_fields" | "login_success" | "login_failed" | "";
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
                },
                { status: 400 }
            );
        }

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

        BackendApiRouteLogger.info("Login success", { email });
        return NextResponse.json(
            {
                success: true,
                messageKey: "login_success",
            },
            { status: 200 }
        );
    } catch (err) {
        BackendApiRouteLogger.error("Login failed", { err });
        return NextResponse.json(
            {
                success: false,
                messageKey: "login_failed",
            },
            { status: 401 }
        );
    }
}
