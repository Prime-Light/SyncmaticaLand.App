import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient, getSessionCookieName } from "@/lib/appwrite/server";
import { BackendApiRouteLogger } from "@/lib/logger";

type RegisterActionState = {
    success: boolean;
    messageKey: "missing_fields" | "email_invalid" | "password_short" | "register_success" | "register_failed" | "";
};

export async function POST(request: Request): Promise<NextResponse<RegisterActionState>> {
    try {
        const formData = await request.formData();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const name = String(formData.get("name") ?? "").trim();

        if (!email || !password || !name) {
            BackendApiRouteLogger.warn("Register request with missing fields", { email, password, name });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "missing_fields",
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
                },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            BackendApiRouteLogger.warn("Register request with password shorter than 8 characters", { password });
            return NextResponse.json(
                {
                    success: false,
                    messageKey: "password_short",
                },
                { status: 400 }
            );
        }

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

        BackendApiRouteLogger.info("Register success", { email, name });
        return NextResponse.json(
            {
                success: true,
                messageKey: "register_success",
            },
            { status: 201 }
        );
    } catch (err) {
        BackendApiRouteLogger.error("Register failed", { err });
        return NextResponse.json(
            {
                success: false,
                messageKey: "register_failed",
            },
            { status: 400 }
        );
    }
}
