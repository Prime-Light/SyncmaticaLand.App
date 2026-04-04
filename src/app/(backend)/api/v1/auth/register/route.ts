import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/middleware/zod-validate-schema";
import { Auth } from "@/schema";
import { registerUser } from "./_logic";
import { IApiErrorResponse } from "@/types/api-error";

export async function POST(req: NextRequest): Promise<NextResponse<Auth.Register.Res | IApiErrorResponse>> {
    const body = await parseBody(req, Auth.Register.ReqSchema);

    const result = await registerUser(body);

    if ("error" in result) {
        return NextResponse.json(result, { status: result.error.code });
    }

    return NextResponse.json(result);
}
