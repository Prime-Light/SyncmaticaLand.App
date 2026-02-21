import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient, getSessionCookieName } from "@/lib/appwrite/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookieName = getSessionCookieName();
        const sessionSecret = cookieStore.get(sessionCookieName)?.value;

        if (!sessionSecret) {
            return NextResponse.json({ user: null }, { status: 200 });
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
                },
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
