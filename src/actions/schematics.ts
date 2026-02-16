"use server";

import { revalidatePath } from "next/cache";
import { ServiceFactory } from "@/services/service-factory";

export interface Schematic {
    id: number;
    name: string;
    author: string;
    category: string;
    downloads: number;
}

export async function getSchematics(limit: number = 10): Promise<Schematic[]> {
    try {
        const schematicService = await ServiceFactory.getSchematicService();
        const schematics = await schematicService.getSchematics(limit);
        return schematics;
    } catch (error) {
        console.error("Error getting schematics:", error);
        return [];
    }
}

export async function getSchematicById(id: number): Promise<Schematic | null> {
    try {
        const schematicService = await ServiceFactory.getSchematicService();
        const schematic = await schematicService.getSchematicById(id);
        return schematic;
    } catch (error) {
        console.error(`Error getting schematic ${id}:`, error);
        return null;
    }
}

export async function createSchematic(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const author = formData.get("author") as string;
        const category = formData.get("category") as string;

        if (!name || !author) {
            return { success: false, error: "缺少必要字段" };
        }

        const schematicService = await ServiceFactory.getSchematicService();
        const newSchematic = await schematicService.createSchematic({
            name,
            author,
            category: category || "未分类",
        });

        revalidatePath("/schematics");

        return { success: true, data: newSchematic };
    } catch (error) {
        console.error("Error creating schematic:", error);
        return { success: false, error: "创建失败" };
    }
}

export async function incrementDownloads(id: number) {
    try {
        const schematicService = await ServiceFactory.getSchematicService();
        const updatedSchematic = await schematicService.incrementDownloads(id);

        revalidatePath(`/schematics/${id}`);

        return { success: true, data: updatedSchematic };
    } catch (error) {
        console.error(`Error incrementing downloads for ${id}:`, error);
        return { success: false, error: "更新失败" };
    }
}
