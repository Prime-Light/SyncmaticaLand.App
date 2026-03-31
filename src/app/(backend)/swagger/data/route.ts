import { swaggerSpec } from "@/swagger/swagger";
import { NextResponse } from "next/server";
import swaggerSpecProduction from "./swagger.json";

export async function GET() {
    let resp;
    switch (process.env.NODE_ENV) {
        case "development":
            resp = swaggerSpec;
            break;
        case "production":
            resp = swaggerSpecProduction;
            break;
    }
    return NextResponse.json(resp);
}
