import { NextRequest } from "next/server";
import z from "zod";

export async function parseBody<T>(req: NextRequest, schema: z.ZodType<T>) {
    const body = await req.json();
    return schema.parse(body);
}
