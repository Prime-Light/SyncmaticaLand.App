import { openApiDocument } from "@/lib/openapi-meta";
import { NextResponse } from "next/server";

export function GET() {
    return NextResponse.json(openApiDocument);
}
