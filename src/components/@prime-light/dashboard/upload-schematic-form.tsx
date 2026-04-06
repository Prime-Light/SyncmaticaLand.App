"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { UploadIcon, FileIcon, XIcon, ImageIcon } from "lucide-react";

const CATEGORIES = [
    { value: "building", label: "建筑" },
    { value: "redstone", label: "红石" },
    { value: "decoration", label: "装饰" },
    { value: "farm", label: "农场" },
    { value: "modern", label: "现代" },
    { value: "medieval", label: "中世纪" },
    { value: "fantasy", label: "幻想" },
    { value: "other", label: "其他" },
] as const;

const MAX_SCHEMATIC_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_SCHEMATIC_TYPES = [".schematic", ".schem", ".litematic", ".nbt"];
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadSchematicForm() {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const [schematicFile, setSchematicFile] = React.useState<File | null>(null);
    const [previewImages, setPreviewImages] = React.useState<File[]>([]);
    const [isDraggingSchematic, setIsDraggingSchematic] = React.useState(false);
    const [isDraggingImage, setIsDraggingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const schematicInputRef = React.useRef<HTMLInputElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    // ── Schematic file handlers ──
    const handleSchematicDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingSchematic(false);
        const file = e.dataTransfer.files[0];
        if (file && validateSchematicFile(file)) {
            setSchematicFile(file);
        }
    }, []);

    const handleSchematicSelect = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && validateSchematicFile(file)) {
                setSchematicFile(file);
            }
        },
        []
    );

    function validateSchematicFile(file: File): boolean {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ACCEPTED_SCHEMATIC_TYPES.includes(ext)) {
            return false;
        }
        if (file.size > MAX_SCHEMATIC_SIZE) {
            return false;
        }
        return true;
    }

    // ── Preview image handlers ──
    const handleImageDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingImage(false);
        const files = Array.from(e.dataTransfer.files).filter(
            (f) => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE
        );
        setPreviewImages((prev) => [...prev, ...files].slice(0, 5));
    }, []);

    const handleImageSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).filter(
            (f) => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE
        );
        setPreviewImages((prev) => [...prev, ...files].slice(0, 5));
    }, []);

    const removeImage = React.useCallback((index: number) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // ── Form submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schematicFile || !title.trim() || !category) return;

        setIsSubmitting(true);
        try {
            // TODO: implement actual upload logic
            await new Promise((resolve) => setTimeout(resolve, 1500));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = !!schematicFile && title.trim().length > 0 && !!category;

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">上传原理图</h1>
                <p className="text-sm text-muted-foreground">
                    分享你的 Minecraft 建筑原理图，展示你的创意
                </p>
            </div>

            <Shadcn.Separator />

            {/* ── Schematic file upload ── */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>原理图文件</Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        支持 .schematic, .schem, .litematic, .nbt 格式，最大 10MB
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    {schematicFile ? (
                        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-4">
                            <FileIcon className="text-primary" />
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="text-sm font-medium">
                                    {schematicFile.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatFileSize(schematicFile.size)}
                                </span>
                            </div>
                            <Shadcn.Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setSchematicFile(null)}>
                                <XIcon />
                            </Shadcn.Button>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingSchematic(true);
                            }}
                            onDragLeave={() => setIsDraggingSchematic(false)}
                            onDrop={handleSchematicDrop}
                            onClick={() => schematicInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-8 transition-colors ${
                                isDraggingSchematic
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}>
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <UploadIcon className="text-muted-foreground" />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <p className="text-sm font-medium">
                                    拖放文件到此处，或点击浏览
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
                    )}
                </Shadcn.CardContent>
            </Shadcn.Card>

            {/* ── Basic info ── */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>基本信息</Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        填写原理图的基本信息，帮助其他玩家更好地了解你的作品
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <Shadcn.FieldGroup>
                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="title">标题</Shadcn.FieldLabel>
                            <Shadcn.Input
                                id="title"
                                placeholder="为你的原理图起一个名字"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Shadcn.FieldDescription>
                                简洁明了的标题能让你的作品更容易被发现
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="description">描述</Shadcn.FieldLabel>
                            <Shadcn.Textarea
                                id="description"
                                placeholder="介绍你的原理图，包括灵感来源、使用方法等"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-24"
                            />
                            <Shadcn.FieldDescription>
                                详细的描述有助于其他玩家理解和使用你的作品
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="category">分类</Shadcn.FieldLabel>
                            <Shadcn.Select value={category} onValueChange={setCategory}>
                                <Shadcn.SelectTrigger id="category">
                                    <Shadcn.SelectValue placeholder="选择分类" />
                                </Shadcn.SelectTrigger>
                                <Shadcn.SelectContent>
                                    <Shadcn.SelectGroup>
                                        {CATEGORIES.map((cat) => (
                                            <Shadcn.SelectItem
                                                key={cat.value}
                                                value={cat.value}>
                                                {cat.label}
                                            </Shadcn.SelectItem>
                                        ))}
                                    </Shadcn.SelectGroup>
                                </Shadcn.SelectContent>
                            </Shadcn.Select>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="tags">标签</Shadcn.FieldLabel>
                            <div className="flex flex-wrap items-center gap-1.5 border border-input bg-transparent px-2.5 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
                                {tags.map((tag) => (
                                    <Shadcn.Badge
                                        key={tag}
                                        variant="secondary"
                                        className="gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTags((prev) => prev.filter((t) => t !== tag))
                                            }
                                            className="cursor-pointer opacity-60 transition-opacity hover:opacity-100">
                                            <XIcon className="size-3" />
                                        </button>
                                    </Shadcn.Badge>
                                ))}
                                <input
                                    id="tags"
                                    placeholder={
                                        tags.length === 0 ? "输入标签后按回车添加" : ""
                                    }
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
                                        if (
                                            e.key === "Backspace" &&
                                            tagInput === "" &&
                                            tags.length > 0
                                        ) {
                                            setTags((prev) => prev.slice(0, -1));
                                        }
                                    }}
                                    className="min-w-20 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <Shadcn.FieldDescription>
                                标签有助于其他玩家搜索和发现你的作品
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>
                    </Shadcn.FieldGroup>
                </Shadcn.CardContent>
            </Shadcn.Card>

            {/* ── Preview images ── */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>预览图片</Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        上传最多 5 张预览图片，支持 PNG、JPG、WebP，单张最大 5MB
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Preview grid */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {previewImages.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="group relative aspect-video overflow-hidden rounded-md border border-border">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="size-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Shadcn.Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:text-white"
                                                onClick={() => removeImage(index)}>
                                                <XIcon />
                                            </Shadcn.Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload zone */}
                        {previewImages.length < 5 && (
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDraggingImage(true);
                                }}
                                onDragLeave={() => setIsDraggingImage(false)}
                                onDrop={handleImageDrop}
                                onClick={() => imageInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-6 transition-colors ${
                                    isDraggingImage
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                }`}>
                                <ImageIcon className="text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    拖放图片到此处，或点击浏览（还可添加{" "}
                                    {5 - previewImages.length} 张）
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

            {/* ── Submit ── */}
            <div className="flex items-center justify-end gap-3">
                <Shadcn.Button type="submit" disabled={!isFormValid || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <UploadIcon data-icon="inline-start" className="animate-pulse" />
                            上传中…
                        </>
                    ) : (
                        <>
                            <UploadIcon data-icon="inline-start" />
                            发布原理图
                        </>
                    )}
                </Shadcn.Button>
            </div>
        </form>
    );
}
