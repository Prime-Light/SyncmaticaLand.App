"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { XIcon, ImageIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { useUpdateSchematic } from "@/hooks";
import { Schematic } from "@/schema";

const MC_VERSIONS: Record<string, string[]> = {
    "1.21.x": [
        "1.21", "1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5", "1.21.6", "1.21.7", "1.21.8",
        "1.21.9", "1.21.10", "1.21.11", "1.21.12", "1.21.13", "1.21.14", "1.21.15", "1.21.16",
        "1.21.17", "1.21.18", "1.21.19", "1.21.20",
    ],
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadImages(files: File[]): Promise<string[]> {
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

export interface EditProjectDialogProps {
    project: Schematic.Schematic.Schematic | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProjectDialog({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) {
    const { updateSchematic, isLoading: isUpdating } = useUpdateSchematic(project?.id ?? "");

    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const [mcMajorVersion, setMcMajorVersion] = React.useState("");
    const [mcMinorVersion, setMcMinorVersion] = React.useState("");
    const [existingImages, setExistingImages] = React.useState<string[]>([]);
    const [newImages, setNewImages] = React.useState<{ file: File; url: string }[]>([]);
    const [isDraggingImage, setIsDraggingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const imageInputRef = React.useRef<HTMLInputElement>(null);
    const newImagesRef = React.useRef(newImages);
    newImagesRef.current = newImages;

    React.useEffect(() => {
        return () => {
            newImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, []);

    React.useEffect(() => {
        if (project && open) {
            setName(project.name);
            setDescription(project.description ?? "");
            setTags(project.tags ?? []);
            setExistingImages(project.images ?? []);
            setNewImages([]);

            const mcVersion = project.mc_version;
            let foundMajor = "";
            let foundMinor = "";

            for (const [major, minors] of Object.entries(MC_VERSIONS)) {
                if (minors.includes(mcVersion)) {
                    foundMajor = major;
                    foundMinor = mcVersion;
                    break;
                }
            }

            setMcMajorVersion(foundMajor);
            setMcMinorVersion(foundMinor);
        }
    }, [project, open]);

    function filterImagesWithFeedback(files: File[]): File[] {
        const valid: File[] = [];
        for (const f of files) {
            if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
                toast.error(`图片 "${f.name}" 格式不支持，仅支持 PNG、JPG、WebP`);
            } else if (f.size > MAX_IMAGE_SIZE) {
                toast.error(`图片 "${f.name}" 大小 ${formatFileSize(f.size)} 超过 5MB 限制`);
            } else {
                valid.push(f);
            }
        }
        return valid;
    }

    const handleImageDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingImage(false);
        const files = filterImagesWithFeedback(Array.from(e.dataTransfer.files));
        setNewImages((prev) => {
            const available = 5 - existingImages.length - prev.length;
            if (available <= 0) {
                if (files.length > 0) toast.error("最多只能上传 5 张预览图片");
                return prev;
            }
            const newEntries = files
                .slice(0, available)
                .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
            return [...prev, ...newEntries];
        });
    }, [existingImages.length]);

    const handleImageSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = filterImagesWithFeedback(Array.from(e.target.files ?? []));
        setNewImages((prev) => {
            const available = 5 - existingImages.length - prev.length;
            if (available <= 0) {
                if (files.length > 0) toast.error("最多只能上传 5 张预览图片");
                return prev;
            }
            const newEntries = files
                .slice(0, available)
                .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
            return [...prev, ...newEntries];
        });
        e.target.value = "";
    }, [existingImages.length]);

    const removeExistingImage = React.useCallback((index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const removeNewImage = React.useCallback((index: number) => {
        setNewImages((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const isFormValid =
        name.trim().length > 0 &&
        description.trim().length > 0 &&
        mcMinorVersion.length > 0 &&
        tags.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !project) return;

        setIsSubmitting(true);
        try {
            let imageUrls = [...existingImages];

            if (newImages.length > 0) {
                toast.info("正在上传新图片...");
                const uploadedUrls = await uploadImages(newImages.map((p) => p.file));
                imageUrls = [...imageUrls, ...uploadedUrls];
            }

            toast.info("正在更新原理图...");
            const result = await updateSchematic({
                name: name.trim(),
                description: description.trim() || null,
                mc_version: mcMinorVersion,
                tags,
                images: imageUrls,
            });

            if (result) {
                toast.success("原理图更新成功！");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("更新原理图失败");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "更新失败，请重试";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalImages = existingImages.length + newImages.length;

    return (
        <Shadcn.Sheet open={open} onOpenChange={onOpenChange}>
            <Shadcn.SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                <Shadcn.SheetHeader className="pb-2">
                    <Shadcn.SheetTitle className="text-base font-semibold">
                        编辑项目
                    </Shadcn.SheetTitle>
                    <Shadcn.SheetDescription>
                        修改原理图的基本信息
                    </Shadcn.SheetDescription>
                </Shadcn.SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-4">
                    <Shadcn.FieldGroup>
                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="edit-name">
                                <span>
                                    标题<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Input
                                id="edit-name"
                                placeholder="为你的原理图起一个名字"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="edit-description">
                                <span>
                                    描述<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Textarea
                                id="edit-description"
                                placeholder="介绍你的原理图，包括灵感来源、使用方法等"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-24"
                            />
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel>
                                <span>
                                    原理图 Minecraft 版本
                                    <span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <div className="flex gap-3">
                                <Shadcn.Select
                                    value={mcMajorVersion}
                                    onValueChange={(v) => {
                                        setMcMajorVersion(v);
                                        setMcMinorVersion("");
                                    }}>
                                    <Shadcn.SelectTrigger className="flex-1">
                                        <Shadcn.SelectValue placeholder="选择大版本" />
                                    </Shadcn.SelectTrigger>
                                    <Shadcn.SelectContent>
                                        <Shadcn.SelectGroup>
                                            {Object.keys(MC_VERSIONS).map((major) => (
                                                <Shadcn.SelectItem key={major} value={major}>
                                                    {major}
                                                </Shadcn.SelectItem>
                                            ))}
                                        </Shadcn.SelectGroup>
                                    </Shadcn.SelectContent>
                                </Shadcn.Select>
                                <Shadcn.Select
                                    value={mcMinorVersion}
                                    onValueChange={setMcMinorVersion}
                                    disabled={!mcMajorVersion}>
                                    <Shadcn.SelectTrigger className="flex-1">
                                        <Shadcn.SelectValue placeholder="选择小版本" />
                                    </Shadcn.SelectTrigger>
                                    <Shadcn.SelectContent>
                                        <Shadcn.SelectGroup>
                                            {(MC_VERSIONS[mcMajorVersion] ?? []).map((minor) => (
                                                <Shadcn.SelectItem key={minor} value={minor}>
                                                    {minor}
                                                </Shadcn.SelectItem>
                                            ))}
                                        </Shadcn.SelectGroup>
                                    </Shadcn.SelectContent>
                                </Shadcn.Select>
                            </div>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="edit-tags">
                                <span>
                                    标签<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <div className="flex flex-wrap items-center gap-1.5 border border-input bg-transparent px-2.5 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
                                {tags.map((tag) => (
                                    <Shadcn.Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            aria-label={`移除标签 ${tag}`}
                                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                                            className="cursor-pointer opacity-60 transition-opacity hover:opacity-100">
                                            <XIcon className="size-3" aria-hidden="true" />
                                        </button>
                                    </Shadcn.Badge>
                                ))}
                                <input
                                    id="edit-tags"
                                    placeholder={tags.length === 0 ? "输入标签后按回车添加" : ""}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && tagInput.trim()) {
                                            e.preventDefault();
                                            const value = tagInput.trim();
                                            if (!tags.includes(value)) {
                                                setTags((prev) => [...prev, value]);
                                            }
                                            setTagInput("");
                                        }
                                        if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
                                            setTags((prev) => prev.slice(0, -1));
                                        }
                                    }}
                                    className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel>
                                <span>
                                    预览图片
                                    <span className="text-sm font-normal text-muted-foreground">
                                        （选填）
                                    </span>
                                </span>
                            </Shadcn.FieldLabel>
                            <Shadcn.FieldDescription>
                                上传最多 5 张预览图片，支持 PNG、JPG、WebP，单张最大 5MB
                            </Shadcn.FieldDescription>

                            <div className="flex flex-col gap-4">
                                {(existingImages.length > 0 || newImages.length > 0) && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {existingImages.map((url, index) => (
                                            <div
                                                key={`existing-${index}`}
                                                className="group relative aspect-video overflow-hidden border border-border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={url}
                                                    alt={`预览图片 ${index + 1}`}
                                                    className="size-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Shadcn.Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`移除预览图片 ${index + 1}`}
                                                        className="text-white hover:text-white"
                                                        onClick={() => removeExistingImage(index)}>
                                                        <XIcon aria-hidden="true" />
                                                    </Shadcn.Button>
                                                </div>
                                            </div>
                                        ))}
                                        {newImages.map(({ file, url }, index) => (
                                            <div
                                                key={`new-${file.name}-${index}`}
                                                className="group relative aspect-video overflow-hidden border border-border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={url}
                                                    alt={file.name}
                                                    className="size-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Shadcn.Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`移除预览图片 ${file.name}`}
                                                        className="text-white hover:text-white"
                                                        onClick={() => removeNewImage(index)}>
                                                        <XIcon aria-hidden="true" />
                                                    </Shadcn.Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {totalImages < 5 && (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDraggingImage(true);
                                        }}
                                        onDragLeave={() => setIsDraggingImage(false)}
                                        onDrop={handleImageDrop}
                                        onClick={() => imageInputRef.current?.click()}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                imageInputRef.current?.click();
                                            }
                                        }}
                                        className={`flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed p-6 transition-colors ${
                                            isDraggingImage
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }`}>
                                        <ImageIcon className="text-muted-foreground" />
                                        <p className="text-base text-muted-foreground">
                                            拖放图片到此处，或点击浏览（还可添加 {5 - totalImages} 张）
                                        </p>
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        </Shadcn.Field>
                    </Shadcn.FieldGroup>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Shadcn.Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            取消
                        </Shadcn.Button>
                        <Shadcn.Button
                            type="submit"
                            disabled={!isFormValid || isSubmitting || isUpdating}>
                            {isSubmitting || isUpdating ? (
                                <>
                                    <UploadIcon data-icon="inline-start" className="animate-pulse" />
                                    保存中…
                                </>
                            ) : (
                                "保存更改"
                            )}
                        </Shadcn.Button>
                    </div>
                </form>
            </Shadcn.SheetContent>
        </Shadcn.Sheet>
    );
}
