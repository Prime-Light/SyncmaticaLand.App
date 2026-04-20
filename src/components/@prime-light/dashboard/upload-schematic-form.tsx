"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Shadcn from "@/components/@shadcn-ui";
import { UploadIcon, FileIcon, XIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useCreateSchematic, useCategories } from "@/hooks";
import { Schematic, WrapSchema } from "@/schema";
import { useCallback } from "react";
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

export function UploadSchematicForm() {
    const router = useRouter();
    const { createSchematic, isLoading: isCreating } = useCreateSchematic();
    const { categories: categoriesData, isLoading: isCategoriesLoading } = useCategories();

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);
    const [tagInput, setTagInput] = React.useState("");
    const [schematicFile, setSchematicFile] = React.useState<File | null>(null);
    const [schematicError, setSchematicError] = React.useState<string | null>(null);
    const [previewImages, setPreviewImages] = React.useState<{ file: File; url: string }[]>([]);
    const [mcMajorVersion, setMcMajorVersion] = React.useState("");
    const [mcMinorVersion, setMcMinorVersion] = React.useState("");
    const [agreedToTerms, setAgreedToTerms] = React.useState(false);
    const [isDraggingSchematic, setIsDraggingSchematic] = React.useState(false);
    const [isDraggingImage, setIsDraggingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);

    const schematicInputRef = React.useRef<HTMLInputElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);
    const previewImagesRef = React.useRef(previewImages);
    previewImagesRef.current = previewImages;

    React.useEffect(() => {
        return () => {
            previewImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, []);

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

    const handleImageDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingImage(false);
        const files = filterImagesWithFeedback(Array.from(e.dataTransfer.files));
        setPreviewImages((prev) => {
            const available = 5 - prev.length;
            if (available <= 0) {
                if (files.length > 0) toast.error("最多只能上传 5 张预览图片");
                return prev;
            }
            const newEntries = files
                .slice(0, available)
                .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
            return [...prev, ...newEntries];
        });
    }, []);

    const handleImageSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = filterImagesWithFeedback(Array.from(e.target.files ?? []));
        setPreviewImages((prev) => {
            const available = 5 - prev.length;
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
    }, []);

    const removeImage = React.useCallback((index: number) => {
        setPreviewImages((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const isFormValid =
        !!schematicFile &&
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        !!categoryId &&
        !!mcMinorVersion &&
        tags.length > 0 &&
        agreedToTerms;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !schematicFile) return;

        setIsSubmitting(true);
        try {
            const ext = "." + schematicFile.name.split(".").pop()?.toLowerCase();
            const format = FORMAT_MAP[ext];
            if (!format) {
                toast.error("无法识别文件格式");
                return;
            }

            toast.info("正在上传原理图文件...");
            const fileUrl = await uploadSchematicFile(schematicFile);

            let imageUrls: string[] = [];
            if (previewImages.length > 0) {
                toast.info("正在上传预览图片...");
                imageUrls = await uploadImages(previewImages.map((p) => p.file));
            }

            toast.info("正在创建原理图记录...");
            const result = await createSchematic({
                name: title.trim(),
                description: description.trim() || null,
                status: "under_review",
                format,
                mc_version: mcMinorVersion,
                tags,
                file_url: fileUrl,
                images: imageUrls,
                category_ids: categoryId ? [categoryId] : [],
            });

            if (result) {
                toast.success("原理图发布成功！");
                router.push(`/schematics/${result.schematic.id}`);
            } else {
                toast.error("创建原理图记录失败");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "上传失败，请重试");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">上传原理图</h1>
                <p className="text-base text-muted-foreground">
                    分享你的 Minecraft 建筑原理图，展示你的创意
                </p>
            </div>

            <Shadcn.Separator />

            {/* Schematic file upload */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>
                        原理图文件<span className="text-destructive">*</span>
                    </Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        支持 .schematic, .schem, .litematic, .nbt 格式，最大 10MB
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    {schematicFile ? (
                        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-4">
                            <FileIcon className="text-primary" />
                            <div className="flex flex-1 flex-col gap-0.5">
                                <span className="text-base font-medium">
                                    {schematicFile.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {formatFileSize(schematicFile.size)}
                                </span>
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
                    ) : (
                        <div
                            role="button"
                            tabIndex={0}
                            aria-describedby={
                                schematicError ? "schematic-file-error" : undefined
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
                            className={`flex cursor-pointer flex-col items-center gap-3 rounded-md border-2 border-dashed p-8 transition-colors ${
                                schematicError
                                    ? "border-destructive bg-destructive/5"
                                    : isDraggingSchematic
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}>
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <UploadIcon className="text-muted-foreground" />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <p className="text-base font-medium">
                                    拖放文件到此处，或点击浏览
                                </p>
                                <p className="text-sm text-muted-foreground">
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
                    {schematicError && (
                        <p
                            id="schematic-file-error"
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
                        填写原理图的基本信息，帮助其他玩家更好地了解你的作品
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <Shadcn.FieldGroup>
                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="title">
                                标题<span className="text-destructive">*</span>
                            </Shadcn.FieldLabel>
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
                            <Shadcn.FieldLabel htmlFor="description">
                                描述<span className="text-destructive">*</span>
                            </Shadcn.FieldLabel>
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
                            <Shadcn.FieldLabel htmlFor="category">
                                分类<span className="text-destructive">*</span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                                disabled={isCategoriesLoading}>
                                <Shadcn.SelectTrigger id="category">
                                    <Shadcn.SelectValue
                                        placeholder={
                                            isCategoriesLoading ? "加载分类中..." : "选择分类"
                                        }
                                    />
                                </Shadcn.SelectTrigger>
                                <Shadcn.SelectContent>
                                    <Shadcn.SelectGroup>
                                        {(categoriesData?.categories ?? []).map((cat) => (
                                            <Shadcn.SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Shadcn.SelectItem>
                                        ))}
                                    </Shadcn.SelectGroup>
                                </Shadcn.SelectContent>
                            </Shadcn.Select>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel>
                                原理图 Minecraft 版本<span className="text-destructive">*</span>
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
                                            {(MC_VERSIONS[mcMajorVersion] ?? []).map(
                                                (minor) => (
                                                    <Shadcn.SelectItem
                                                        key={minor}
                                                        value={minor}>
                                                        {minor}
                                                    </Shadcn.SelectItem>
                                                )
                                            )}
                                        </Shadcn.SelectGroup>
                                    </Shadcn.SelectContent>
                                </Shadcn.Select>
                            </div>
                            <Shadcn.FieldDescription>
                                选择该原理图适用的 Minecraft 版本
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="tags">
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
                                                setTags((prev) => prev.filter((t) => t !== tag))
                                            }
                                            className="cursor-pointer opacity-60 transition-opacity hover:opacity-100">
                                            <XIcon className="size-3" aria-hidden="true" />
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
                                            if (!tags.includes(value))
                                                setTags((prev) => [...prev, value]);
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
                                    className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                            <Shadcn.FieldDescription>
                                标签有助于其他玩家搜索和发现你的作品
                            </Shadcn.FieldDescription>
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
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {previewImages.map(({ file, url }, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
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
                                                onClick={() => removeImage(index)}>
                                                <XIcon aria-hidden="true" />
                                            </Shadcn.Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {previewImages.length < 5 && (
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

            {/* Agreement */}
            <div className="flex items-center gap-3">
                <Shadcn.Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => {
                        if (checked) setSheetOpen(true);
                        else setAgreedToTerms(false);
                    }}
                />
                <Shadcn.Label htmlFor="agree-terms" className="cursor-pointer text-sm">
                    我已阅读并同意{" "}
                    <Shadcn.Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <Shadcn.SheetTrigger asChild>
                            <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary underline underline-offset-2 hover:opacity-80">
                                投影共和国原理图分享协议
                            </button>
                        </Shadcn.SheetTrigger>
                        <Shadcn.SheetContent
                            side="right"
                            className="w-full overflow-y-auto sm:max-w-lg">
                            <Shadcn.SheetHeader className="pb-2">
                                <Shadcn.SheetTitle className="text-base font-semibold">
                                    投影共和国原理图分享协议
                                </Shadcn.SheetTitle>
                                <Shadcn.SheetDescription>
                                    最后更新：2026 年 4 月 9 日
                                </Shadcn.SheetDescription>
                            </Shadcn.SheetHeader>
                            <div className="space-y-4 px-4 pb-6 text-xs/relaxed text-foreground">
                                <p className="text-muted-foreground">
                                    在上传原理图之前，请仔细阅读以下协议。上传即表示您已阅读、理解并同意受本协议约束。
                                </p>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">一、定义</h3>
                                    <p>
                                        「投影共和国」（下称「本平台」）是一个用于分享 Minecraft
                                        建筑原理图的社区平台。
                                    </p>
                                    <p>
                                        「原理图」是指使用 Schematica、Litematica、WorldEdit
                                        等工具导出的建筑蓝图文件（如
                                        .schematic、.schem、.litematic、.nbt 等格式）。
                                    </p>
                                    <p>「用户」是指注册并使用本平台的任何个人或组织。</p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">二、上传资格</h3>
                                    <p>您须年满 16 周岁或在监护人同意下方可上传内容。</p>
                                    <p>
                                        您须对上传的原理图文件及预览图片拥有合法的所有权或充分的授权。
                                    </p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">三、内容规范</h3>
                                    <p>
                                        您保证上传的原理图为您的原创作品，或已获得原作者的明确授权。
                                    </p>
                                    <p>严禁上传以下内容：</p>
                                    <ul className="list-inside list-disc space-y-0.5 pl-2 text-muted-foreground">
                                        <li>侵犯他人知识产权的内容；</li>
                                        <li>包含恶意代码或命令方块滥用脚本的文件；</li>
                                        <li>具有歧视性、侮辱性或政治敏感性的建筑；</li>
                                        <li>与 Minecraft 建筑完全无关的文件。</li>
                                    </ul>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">四、知识产权授权</h3>
                                    <p>
                                        您保留上传内容的版权。但您在提交原理图的同时，授予本平台全球范围内免费、非独占、可再授权的权利，用于展示、传播、存储及推广您的原理图。
                                    </p>
                                    <p>
                                        平台不会将您的原理图用于商业销售，但可在社区活动或推广中展示或引用。
                                    </p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">五、侵权投诉</h3>
                                    <p>
                                        如您认为平台上的某原理图侵犯了您的版权，可通过平台提供的举报功能或发送邮件至官方邮箱提起投诉。我们将在
                                        7 个工作日内处理有效投诉。
                                    </p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">六、免责声明</h3>
                                    <p>
                                        本平台对用户上传的原理图质量、安全性及适用性不作任何保证，使用原理图所产生的任何后果由下载者自行承担。
                                    </p>
                                    <p>
                                        用户因上传违规内容所引发的法律责任，由上传者本人独立承担，与本平台无关。
                                    </p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">七、协议修改</h3>
                                    <p>
                                        本平台保留随时修改本协议的权利。修改后的协议将在平台公告后生效。继续使用本平台即视为接受修改后的协议。
                                    </p>
                                </section>
                                <section className="space-y-1.5">
                                    <h3 className="text-sm font-semibold">八、联系我们</h3>
                                    <p>如有任何疑问，欢迎通过平台官方渠道与我们联系。</p>
                                </section>
                            </div>
                            <Shadcn.SheetFooter className="pt-0">
                                <Shadcn.Button
                                    type="button"
                                    className="w-full"
                                    onClick={() => {
                                        setAgreedToTerms(true);
                                        setSheetOpen(false);
                                    }}>
                                    我已阅读并同意
                                </Shadcn.Button>
                            </Shadcn.SheetFooter>
                        </Shadcn.SheetContent>
                    </Shadcn.Sheet>
                </Shadcn.Label>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Shadcn.Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting || isCreating}>
                    {isSubmitting || isCreating ? (
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
