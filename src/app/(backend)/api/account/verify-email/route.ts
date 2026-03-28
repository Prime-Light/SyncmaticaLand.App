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
