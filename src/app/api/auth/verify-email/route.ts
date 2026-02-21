import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!userId || !secret) {
        console.debug("[ERR]: No userId or secret!");
        return NextResponse.redirect(new URL("/?verify=failed", request.url));
    }

    try {
        const { account } = createSessionClient();
        await account.updateEmailVerification({ userId, secret });
        return NextResponse.redirect(new URL("/?verify=success", request.url));
    } catch (error) {
        console.debug("[ERR]: caught unexcepted error: \n" + error);
        return NextResponse.redirect(new URL("/?verify=failed", request.url));
    }
}
