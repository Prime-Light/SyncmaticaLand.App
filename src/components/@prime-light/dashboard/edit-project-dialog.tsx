"use client";

import * as React from "react";
import * as Shadcn from "@/components/@shadcn-ui";
import { UploadIcon, FileIcon, XIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useUpdateSchematic, useSchematic, useCategories } from "@/hooks";
import { Schematic, WrapSchema } from "@/schema";
import { useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/@shadcn-ui/dialog";
import {
    MC_VERSIONS,
    MAX_IMAGE_SIZE,
    ACCEPTED_IMAGE_TYPES,
    formatFileSize,
    uploadImages,
} from "./shared";

const MAX_SCHEMATIC_SIZE = 10 * 1024 * 1024;
const ACCEPTED_SCHEMATIC_TYPES = [".schematic", ".schem", ".litematic", ".nbt"];

const FORMAT_MAP: Record<string, Schematic.Schematic.ProjectFormat> = {
    ".litematic": "litematic",
    ".schem": "schem",
    ".schematic": "schem",
    ".nbt": "nbt",
};

function getFileNameFromUrl(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        return pathname.split("/").pop() || url;
    } catch {
        return url.split("/").pop() || url;
    }
}

async function uploadSchematicFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/v1/schematics/upload", { method: "POST", body: formData });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `上传失败: ${res.status}`);
    }
    const result = (await res.json()) as WrapSchema<Schematic.Upload.UploadRes>;
    return result.data.file_url;
}

export interface EditProjectDialogProps {
    project: Schematic.Schematic.Schematic | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditProjectDialog({
    project,
    open,
    onOpenChange,
    onSuccess,
}: EditProjectDialogProps) {
    const { updateSchematic, isLoading: isUpdating } = useUpdateSchematic(project?.id ?? "");
    const { schematic: fullSchematic, isLoading: isLoadingFull } = useSchematic(
        project?.id ?? ""
    );
    const { categories: categoriesData, isLoading: isCategoriesLoading } = useCategories();

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const [schematicFile, setSchematicFile] = React.useState<File | null>(null);
    const [schematicError, setSchematicError] = React.useState<string | null>(null);
    const [existingImages, setExistingImages] = React.useState<string[]>([]);
    const [newImages, setNewImages] = React.useState<{ file: File; url: string }[]>([]);
    const [mcMajorVersion, setMcMajorVersion] = React.useState("");
    const [mcMinorVersion, setMcMinorVersion] = React.useState("");
    const [isDraggingSchematic, setIsDraggingSchematic] = React.useState(false);
    const [isDraggingImage, setIsDraggingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const schematicInputRef = React.useRef<HTMLInputElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);
    const newImagesRef = React.useRef(newImages);
    newImagesRef.current = newImages;

    React.useEffect(() => {
        return () => {
            newImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, []);

    // Reset form when dialog opens with a new project
    React.useEffect(() => {
        if (project && open) {
            setTitle(project.name);
            setDescription(project.description ?? "");
            setTags(project.tags ?? []);
            setTagInput("");
            setExistingImages(project.images ?? []);
            setNewImages([]);
            setSchematicFile(null);
            setSchematicError(null);

            let foundMajor = "";
            let foundMinor = "";
            for (const [major, minors] of Object.entries(MC_VERSIONS)) {
                if (minors.includes(project.mc_version)) {
                    foundMajor = major;
                    foundMinor = project.mc_version;
                    break;
                }
            }
            setMcMajorVersion(foundMajor);
            setMcMinorVersion(foundMinor);

            // Set category from full schematic data when loaded
            if (fullSchematic?.categories && fullSchematic.categories.length > 0) {
                setCategoryId(fullSchematic.categories[0].id);
            } else {
                setCategoryId("");
            }
        }
    }, [project, open, fullSchematic]);

    function validateSchematicFile(file: File): string | null {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ACCEPTED_SCHEMATIC_TYPES.includes(ext)) {
            return `不支持的文件类型 "${ext}"，仅支持 ${ACCEPTED_SCHEMATIC_TYPES.join("、")}`;
        }
        if (file.size > MAX_SCHEMATIC_SIZE) {
            return `文件大小 ${formatFileSize(file.size)} 超过 10MB 限制`;
        }
        return null;
    }

    const handleSchematicValidation = useCallback((file: File) => {
        const error = validateSchematicFile(file);
        if (error) {
            setSchematicError(error);
            setSchematicFile(null);
        } else {
            setSchematicError(null);
            setSchematicFile(file);
        }
    }, []);

    const handleSchematicDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDraggingSchematic(false);
            const file = e.dataTransfer.files[0];
            if (file) handleSchematicValidation(file);
        },
        [handleSchematicValidation]
    );

    const handleSchematicSelect = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleSchematicValidation(file);
            e.target.value = "";
        },
        [handleSchematicValidation]
    );

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

    const handleImageDrop = React.useCallback(
        (e: React.DragEvent) => {
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
        },
        [existingImages.length]
    );

    const handleImageSelect = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
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
        },
        [existingImages.length]
    );

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
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        !!categoryId &&
        !!mcMinorVersion &&
        tags.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !project) return;

        setIsSubmitting(true);
        try {
            let fileUrl = project.file_url;
            let format = project.format;

            if (schematicFile) {
                toast.info("正在上传原理图文件...");
                fileUrl = await uploadSchematicFile(schematicFile);
                const ext = "." + schematicFile.name.split(".").pop()?.toLowerCase();
                const mappedFormat = FORMAT_MAP[ext];
                if (mappedFormat) {
                    format = mappedFormat;
                }
            }

            let imageUrls = [...existingImages];
            if (newImages.length > 0) {
                toast.info("正在上传新图片...");
                const uploadedUrls = await uploadImages(newImages.map((p) => p.file));
                imageUrls = [...imageUrls, ...uploadedUrls];
            }

            toast.info("正在更新原理图...");
            const result = await updateSchematic({
                name: title.trim(),
                description: description.trim() || null,
                mc_version: mcMinorVersion,
                tags,
                images: imageUrls,
                file_url: fileUrl,
                format,
                status: "under_review",
                category_ids: categoryId ? [categoryId] : [],
            });

            if (result) {
                toast.success("原理图更新成功！");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("更新原理图失败");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "更新失败，请重试");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalImages = existingImages.length + newImages.length;
    const currentFileName = schematicFile
        ? schematicFile.name
        : project
          ? getFileNameFromUrl(project.file_url)
          : "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl lg:max-w-4xl">
                <DialogHeader className="shrink-0 flex-row items-center justify-between border-b bg-muted px-6 py-4">
                    <div className="flex items-baseline gap-3">
                        <DialogTitle className="text-lg">编辑项目</DialogTitle>
                        <DialogDescription className="mt-0">
                            修改原理图的所有信息。注意：保存后将重新进入审核状态。
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="flex flex-col gap-4">
                            {/* Schematic file */}
                            <Shadcn.Card>
                                <Shadcn.CardHeader>
                                    <Shadcn.CardTitle>原理图文件</Shadcn.CardTitle>
                                    <Shadcn.CardDescription>
                                        支持 .schematic, .schem, .litematic, .nbt 格式，最大
                                        10MB。不上传则保留原文件。
                                    </Shadcn.CardDescription>
                                </Shadcn.CardHeader>
                                <Shadcn.CardContent>
                                    {schematicFile || project ? (
                                        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-4">
                                            <FileIcon className="text-primary" />
                                            <div className="flex flex-1 flex-col gap-0.5">
                                                <span className="text-base font-medium">
                                                    {currentFileName}
                                                </span>
                                                {schematicFile && (
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatFileSize(schematicFile.size)}
                                                    </span>
                                                )}
                                            </div>
                                            <Shadcn.Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="移除原理图文件"
                                                onClick={() => {
                                                    setSchematicFile(null);
                                                    if (schematicInputRef.current)
                                                        schematicInputRef.current.value = "";
                                                }}>
                                                <XIcon aria-hidden="true" />
                                            </Shadcn.Button>
                                        </div>
                                    ) : null}

                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-describedby={
                                            schematicError
                                                ? "edit-schematic-file-error"
                                                : undefined
                                        }
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDraggingSchematic(true);
                                        }}
                                        onDragLeave={() => setIsDraggingSchematic(false)}
                                        onDrop={handleSchematicDrop}
                                        onClick={() => schematicInputRef.current?.click()}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                schematicInputRef.current?.click();
                                            }
                                        }}
                                        className={`mt-3 flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors ${
                                            schematicError
                                                ? "border-destructive bg-destructive/5"
                                                : isDraggingSchematic
                                                  ? "border-primary bg-primary/5"
                                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        }`}>
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <UploadIcon className="text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col items-center gap-1 text-center">
                                            <p className="text-sm font-medium">
                                                点击或拖放上传新文件替换
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                .schematic / .schem / .litematic / .nbt
                                            </p>
                                        </div>
                                        <input
                                            ref={schematicInputRef}
                                            type="file"
                                            accept={ACCEPTED_SCHEMATIC_TYPES.join(",")}
                                            onChange={handleSchematicSelect}
                                            className="hidden"
                                        />
                                    </div>
                                    {schematicError && (
                                        <p
                                            id="edit-schematic-file-error"
                                            role="alert"
                                            className="mt-2 text-sm text-destructive">
                                            {schematicError}
                                        </p>
                                    )}
                                </Shadcn.CardContent>
                            </Shadcn.Card>

                            {/* Basic info */}
                            <Shadcn.Card>
                                <Shadcn.CardHeader>
                                    <Shadcn.CardTitle>基本信息</Shadcn.CardTitle>
                                    <Shadcn.CardDescription>
                                        填写原理图的基本信息
                                    </Shadcn.CardDescription>
                                </Shadcn.CardHeader>
                                <Shadcn.CardContent>
                                    <Shadcn.FieldGroup>
                                        <Shadcn.Field>
                                            <Shadcn.FieldLabel htmlFor="edit-title">
                                                标题<span className="text-destructive">*</span>
                                            </Shadcn.FieldLabel>
                                            <Shadcn.Input
                                                id="edit-title"
                                                placeholder="为你的原理图起一个名字"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </Shadcn.Field>

                                        <Shadcn.Field>
                                            <Shadcn.FieldLabel htmlFor="edit-description">
                                                描述<span className="text-destructive">*</span>
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
                                            <Shadcn.FieldLabel htmlFor="edit-category">
                                                分类<span className="text-destructive">*</span>
                                            </Shadcn.FieldLabel>
                                            <Shadcn.Select
                                                value={categoryId}
                                                onValueChange={setCategoryId}
                                                disabled={isCategoriesLoading || isLoadingFull}>
                                                <Shadcn.SelectTrigger id="edit-category">
                                                    <Shadcn.SelectValue
                                                        placeholder={
                                                            isCategoriesLoading || isLoadingFull
                                                                ? "加载中..."
                                                                : "选择分类"
                                                        }
                                                    />
                                                </Shadcn.SelectTrigger>
                                                <Shadcn.SelectContent>
                                                    <Shadcn.SelectGroup>
                                                        {(categoriesData?.categories ?? []).map(
                                                            (cat) => (
                                                                <Shadcn.SelectItem
                                                                    key={cat.id}
                                                                    value={cat.id}>
                                                                    {cat.name}
                                                                </Shadcn.SelectItem>
                                                            )
                                                        )}
                                                    </Shadcn.SelectGroup>
                                                </Shadcn.SelectContent>
                                            </Shadcn.Select>
                                        </Shadcn.Field>

                                        <Shadcn.Field>
                                            <Shadcn.FieldLabel>
                                                原理图 Minecraft 版本
                                                <span className="text-destructive">*</span>
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
                                                            {Object.keys(MC_VERSIONS).map(
                                                                (major) => (
                                                                    <Shadcn.SelectItem
                                                                        key={major}
                                                                        value={major}>
                                                                        {major}
                                                                    </Shadcn.SelectItem>
                                                                )
                                                            )}
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
                                                            {(
                                                                MC_VERSIONS[mcMajorVersion] ??
                                                                []
                                                            ).map((minor) => (
                                                                <Shadcn.SelectItem
                                                                    key={minor}
                                                                    value={minor}>
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
                                                标签<span className="text-destructive">*</span>
                                            </Shadcn.FieldLabel>
                                            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
                                                {tags.map((tag) => (
                                                    <Shadcn.Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="gap-1">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            aria-label={`移除标签 ${tag}`}
                                                            onClick={() =>
                                                                setTags((prev) =>
                                                                    prev.filter(
                                                                        (t) => t !== tag
                                                                    )
                                                                )
                                                            }
                                                            className="cursor-pointer opacity-60 transition-opacity hover:opacity-100">
                                                            <XIcon
                                                                className="size-3"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </Shadcn.Badge>
                                                ))}
                                                <input
                                                    id="edit-tags"
                                                    placeholder={
                                                        tags.length === 0
                                                            ? "输入标签后按回车添加"
                                                            : ""
                                                    }
                                                    value={tagInput}
                                                    onChange={(e) =>
                                                        setTagInput(e.target.value)
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter" &&
                                                            tagInput.trim()
                                                        ) {
                                                            e.preventDefault();
                                                            const value = tagInput.trim();
                                                            if (!tags.includes(value))
                                                                setTags((prev) => [
                                                                    ...prev,
                                                                    value,
                                                                ]);
                                                            setTagInput("");
                                                        }
                                                        if (
                                                            e.key === "Backspace" &&
                                                            tagInput === "" &&
                                                            tags.length > 0
                                                        ) {
                                                            setTags((prev) =>
                                                                prev.slice(0, -1)
                                                            );
                                                        }
                                                    }}
                                                    className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </Shadcn.Field>
                                    </Shadcn.FieldGroup>
                                </Shadcn.CardContent>
                            </Shadcn.Card>

                            {/* Preview images */}
                            <Shadcn.Card>
                                <Shadcn.CardHeader>
                                    <Shadcn.CardTitle>
                                        预览图片
                                        <span className="text-sm font-normal text-muted-foreground">
                                            （选填）
                                        </span>
                                    </Shadcn.CardTitle>
                                    <Shadcn.CardDescription>
                                        上传最多 5 张预览图片，支持 PNG、JPG、WebP，单张最大 5MB
                                    </Shadcn.CardDescription>
                                </Shadcn.CardHeader>
                                <Shadcn.CardContent>
                                    <div className="flex flex-col gap-4">
                                        {(existingImages.length > 0 ||
                                            newImages.length > 0) && (
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
                                                                onClick={() =>
                                                                    removeExistingImage(index)
                                                                }>
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
                                                                onClick={() =>
                                                                    removeNewImage(index)
                                                                }>
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
                                                className={`flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors ${
                                                    isDraggingImage
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                }`}>
                                                <ImageIcon className="text-muted-foreground" />
                                                <p className="text-base text-muted-foreground">
                                                    拖放图片到此处，或点击浏览（还可添加{" "}
                                                    {5 - totalImages} 张）
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
                                </Shadcn.CardContent>
                            </Shadcn.Card>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted px-6 py-4">
                        <Shadcn.Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            取消
                        </Shadcn.Button>
                        <Shadcn.Button
                            type="submit"
                            disabled={!isFormValid || isSubmitting || isUpdating}>
                            {isSubmitting || isUpdating ? "保存中…" : "保存修改"}
                        </Shadcn.Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
