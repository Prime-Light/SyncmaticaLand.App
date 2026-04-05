import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { ApiError, ApiErrorCode } from "../api-responses";
import { IApiErrorResponse } from "@/types/api-error";

type ParseResult<T> =
    | { success: true; body: T }
    | { success: false; error: NextResponse<IApiErrorResponse> };

export async function parseBody<T>(
    req: NextRequest,
    schema: z.ZodType<T>
): Promise<ParseResult<T>> {
    const body = await req.json();
    const { data, error, success } = schema.safeParse(body);

    if (!success) {
        return {
            success: false,
            error: new ApiError()
                .code(ApiErrorCode.BAD_REQUEST)
                .message("Invalid request body")
                .details({
                    errors: z.treeifyError(error),
                })
                .build(),
        };
    }

    return { success: true, body: data };
}
