import { NextRequest, NextResponse } from "next/server";
import { ServiceFactory } from "@/services/service-factory";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const schematicService = await ServiceFactory.getSchematicService();
        const schematic = await schematicService.getSchematicById(id);

        if (!schematic) {
            return NextResponse.json(
                { success: false, error: "原理图不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: schematic,
        });
    } catch (error) {
        console.error("Error fetching schematic:", error);
        return NextResponse.json(
            { success: false, error: "获取原理图失败" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        
        const schematicService = await ServiceFactory.getSchematicService();
        const updatedSchematic = await schematicService.updateSchematic(id, body);

        if (!updatedSchematic) {
            return NextResponse.json(
                { success: false, error: "原理图不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedSchematic,
        });
    } catch (error) {
        console.error("Error updating schematic:", error);
        return NextResponse.json(
            { success: false, error: "更新原理图失败" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const schematicService = await ServiceFactory.getSchematicService();
        const deleted = await schematicService.deleteSchematic(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "原理图不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "原理图已删除",
        });
    } catch (error) {
        console.error("Error deleting schematic:", error);
        return NextResponse.json(
            { success: false, error: "删除原理图失败" },
            { status: 500 }
        );
    }
}
