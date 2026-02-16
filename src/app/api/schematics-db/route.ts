import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        const schematics = await query(
            `SELECT id, name, author, category, downloads, created_at 
             FROM schematics 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await queryOne<{ count: string }>(
            "SELECT COUNT(*) as count FROM schematics"
        );

        return NextResponse.json({
            success: true,
            data: schematics,
            pagination: {
                total: parseInt(countResult?.count || "0"),
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

        const result = await queryOne(
            `INSERT INTO schematics (name, author, category, description, downloads, created_at)
             VALUES ($1, $2, $3, $4, 0, NOW())
             RETURNING *`,
            [name, author, category || "未分类", description || ""]
        );

        return NextResponse.json(
            { success: true, data: result },
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
