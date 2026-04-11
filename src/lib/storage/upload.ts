import { supabaseServerAdmin } from "@/lib/database/server";
import { supabaseClient } from "@/lib/database/pure-client";

export const BUCKET_NAME = "bucket-1";
export const MAX_SCHEMATIC_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_SCHEMATIC_TYPES = [".schematic", ".schem", ".litematic", ".nbt"];
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function generateSchematicPath(userId: string, fileName: string): string {
    const timestamp = Date.now();
    return `schematics/${userId}/${timestamp}_${fileName}`;
}

export function generateImagePath(userId: string, schematicId: string, fileName: string): string {
    const timestamp = Date.now();
    return `images/${userId}/${schematicId}/${timestamp}_${fileName}`;
}

export async function uploadSchematicFile(
    file: File | Buffer,
    userId: string,
    fileName: string
): Promise<{ url: string; error: Error | null }> {
    const path = generateSchematicPath(userId, fileName);

    const isServer = typeof window === "undefined";
    const supabase = isServer ? supabaseServerAdmin : supabaseClient;

    const fileBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, fileBuffer, {
        contentType: "application/octet-stream",
        upsert: false,
    });

    if (error) {
        return { url: "", error: new Error(error.message) };
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return { url: urlData.publicUrl, error: null };
}

export async function uploadImageFile(
    file: File | Buffer,
    userId: string,
    schematicId: string,
    fileName: string
): Promise<{ url: string; error: Error | null }> {
    const path = generateImagePath(userId, schematicId, fileName);

    const isServer = typeof window === "undefined";
    const supabase = isServer ? supabaseServerAdmin : supabaseClient;

    const fileBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    let contentType = "image/png";
    if (file instanceof File && file.type) {
        contentType = file.type;
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, fileBuffer, {
        contentType,
        upsert: false,
    });

    if (error) {
        return { url: "", error: new Error(error.message) };
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return { url: urlData.publicUrl, error: null };
}

export async function deleteFile(path: string): Promise<{ error: Error | null }> {
    const isServer = typeof window === "undefined";
    const supabase = isServer ? supabaseServerAdmin : supabaseClient;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
        return { error: new Error(error.message) };
    }

    return { error: null };
}

export function getPublicUrl(path: string): string {
    const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
}
