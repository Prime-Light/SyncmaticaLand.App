import { Schematic } from "@/schema";

export const MC_VERSIONS: Record<string, string[]> = {
    "1.21.x": ["1.21", "1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5"],
    "1.20.x": ["1.20", "1.20.1", "1.20.2", "1.20.3", "1.20.4", "1.20.5", "1.20.6"],
    "1.19.x": ["1.19", "1.19.1", "1.19.2", "1.19.3", "1.19.4"],
    "1.18.x": ["1.18", "1.18.1", "1.18.2"],
    "1.17.x": ["1.17", "1.17.1"],
    "1.16.x": ["1.16", "1.16.1", "1.16.2", "1.16.3", "1.16.4", "1.16.5"],
    "1.15.x": ["1.15", "1.15.1", "1.15.2"],
    "1.14.x": ["1.14", "1.14.1", "1.14.2", "1.14.3", "1.14.4"],
    "1.13.x": ["1.13", "1.13.1", "1.13.2"],
    "1.12.x": ["1.12", "1.12.1", "1.12.2"],
    "1.8.x": ["1.8", "1.8.1", "1.8.2", "1.8.3", "1.8.4", "1.8.5", "1.8.6", "1.8.7", "1.8.8", "1.8.9"],
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const FORMAT_LABELS: Record<Schematic.Schematic.ProjectFormat, string> = {
    litematic: "Litematic",
    schem: "Schematic",
    nbt: "NBT",
    bp: "Bedrock Pack",
};

export const STATUS_LABELS: Record<Schematic.Schematic.ProjectStatus, string> = {
    draft: "草稿",
    published: "已发布",
    under_review: "审核中",
    rejected: "已拒绝",
};

export const STATUS_VARIANTS: Record<
    Schematic.Schematic.ProjectStatus,
    "secondary" | "default" | "outline" | "destructive"
> = {
    draft: "secondary",
    published: "default",
    under_review: "outline",
    rejected: "destructive",
};

export function formatDate(dateString: string, withTime = false): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    };
    return date.toLocaleDateString("zh-CN", options);
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadImages(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/v1/schematics/upload/images", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `图片上传失败: ${res.status}`);
    }

    const result = await res.json();
    return result.data.files.map((f: { file_url: string }) => f.file_url);
}
