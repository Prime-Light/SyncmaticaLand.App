import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/services/service-factory";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        const schematicService = await ServiceFactory.getSchematicService();
        const schematics = await schematicService.getSchematics(limit, offset);

        return NextResponse.json({
            success: true,
            data: schematics,
            pagination: {
                total: schematics.length,
                limit,
                offset,
            },
        });
    } catch (error) {
        console.error("Error fetching schematics:", error);
        return NextResponse.json(
            { success: false, error: "获取原理图失败" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, author, category, description } = body;

        if (!name || !author) {
            return NextResponse.json(
                { success: false, error: "缺少必要字段" },
                { status: 400 }
            );
        }

        const schematicService = await ServiceFactory.getSchematicService();
        const newSchematic = await schematicService.createSchematic({
            name,
            author,
            category: category || "未分类",
            description: description || "",
        });

        return NextResponse.json(
            { success: true, data: newSchematic },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating schematic:", error);
        return NextResponse.json(
            { success: false, error: "创建原理图失败" },
            { status: 500 }
        );
    }
}
