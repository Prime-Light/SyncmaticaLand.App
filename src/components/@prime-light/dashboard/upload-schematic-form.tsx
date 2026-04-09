"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { UploadIcon, FileIcon, XIcon, ImageIcon } from "lucide-react";

const MC_VERSIONS: Record<string, string[]> = {
    "1.21.x": [
        "1.21",
        "1.21.1",
        "1.21.2",
        "1.21.3",
        "1.21.4",
        "1.21.5",
        "1.21.6",
        "1.21.7",
        "1.21.8",
        "1.21.9",
        "1.21.10",
        "1.21.11",
        "1.21.12",
        "1.21.13",
        "1.21.14",
        "1.21.15",
        "1.21.16",
        "1.21.17",
        "1.21.18",
        "1.21.19",
        "1.21.20",
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
    "1.8.x": [
        "1.8",
        "1.8.1",
        "1.8.2",
        "1.8.3",
        "1.8.4",
        "1.8.5",
        "1.8.6",
        "1.8.7",
        "1.8.8",
        "1.8.9",
    ],
};

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
    const [previewImages, setPreviewImages] = React.useState<{ file: File; url: string }[]>([]);
    const [mcMajorVersion, setMcMajorVersion] = React.useState("");
    const [mcMinorVersion, setMcMinorVersion] = React.useState("");
    const [agreedToTerms, setAgreedToTerms] = React.useState(false);
    const [isDraggingSchematic, setIsDraggingSchematic] = React.useState(false);
    const [isDraggingImage, setIsDraggingImage] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const schematicInputRef = React.useRef<HTMLInputElement>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);
    const previewImagesRef = React.useRef(previewImages);
    previewImagesRef.current = previewImages;

    React.useEffect(() => {
        return () => {
            previewImagesRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, []);

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
            e.target.value = "";
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
        setPreviewImages((prev) => {
            const available = 5 - prev.length;
            if (available <= 0) return prev;
            const newEntries = files
                .slice(0, available)
                .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
            return [...prev, ...newEntries];
        });
    }, []);

    const handleImageSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).filter(
            (f) => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE
        );
        setPreviewImages((prev) => {
            const available = 5 - prev.length;
            if (available <= 0) return prev;
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
        !!category &&
        !!mcMinorVersion &&
        tags.length > 0 &&
        agreedToTerms;

    // ── Form submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        try {
            // TODO: implement actual upload logic
            await new Promise((resolve) => setTimeout(resolve, 1500));
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

            {/* ── Schematic file upload ── */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>
                        <span>
                            原理图文件<span className="text-destructive">*</span>
                        </span>
                    </Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        支持 .schematic, .schem, .litematic, .nbt 格式，最大 10MB
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    {schematicFile ? (
                        <div className="flex items-center gap-3 border border-border bg-muted/50 p-4">
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
                                onClick={() => {
                                    setSchematicFile(null);
                                    if (schematicInputRef.current)
                                        schematicInputRef.current.value = "";
                                }}>
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
                            className={`flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed p-8 transition-colors ${
                                isDraggingSchematic
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
                            <Shadcn.FieldLabel htmlFor="title">
                                <span>
                                    标题<span className="text-destructive">*</span>
                                </span>
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
                                <span>
                                    描述<span className="text-destructive">*</span>
                                </span>
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
                                <span>
                                    分类<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
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
                                <span>
                                    标签<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <div className="flex flex-wrap items-center gap-1.5 border border-input bg-transparent px-2.5 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
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

            {/* ── Preview images ── */}
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>
                        <span>
                            预览图片
                            <span className="text-sm font-normal text-muted-foreground">
                                （选填）
                            </span>
                        </span>
                    </Shadcn.CardTitle>
                    <Shadcn.CardDescription>
                        上传最多 5 张预览图片，支持 PNG、JPG、WebP，单张最大 5MB
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Preview grid */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {previewImages.map(({ file, url }, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="group relative aspect-video overflow-hidden border border-border">
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
                                className={`flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed p-6 transition-colors ${
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

            {/* ── Agreement ── */}
            <div className="flex items-center gap-3">
                <Shadcn.Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Shadcn.Label htmlFor="agree-terms" className="cursor-pointer text-sm">
                    我已阅读并同意{" "}
                    <Shadcn.Sheet>
                        <Shadcn.SheetTrigger asChild>
                            <button
                                type="button"
                                className="text-primary underline underline-offset-2 hover:opacity-80">
                                投影共和国原理图分享协议
                            </button>
                        </Shadcn.SheetTrigger>
                        <Shadcn.SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                            <Shadcn.SheetHeader className="pb-2">
                                <Shadcn.SheetTitle className="text-base font-semibold">
                                    投影共和国原理图分享协议
                                </Shadcn.SheetTitle>
                                <Shadcn.SheetDescription>
                                    最后更新：2026 年 4 月 9 日
                                </Shadcn.SheetDescription>
                            </Shadcn.SheetHeader>
                            <div className="px-4 pb-6 text-xs/relaxed text-foreground space-y-4">
                                <p className="text-muted-foreground">
                                    在上传原理图之前，请仔细阅读以下协议。上传即表示您已阅读、理解并同意受本协议约束。
                                </p>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">一、定义</h3>
                                    <p>「投影共和国」（下称「本平台」）是一个用于分享 Minecraft 建筑原理图的社区平台。</p>
                                    <p>「原理图」是指使用 Schematica、Litematica、WorldEdit 等工具导出的建筑蓝图文件（如 .schematic、.schem、.litematic、.nbt 等格式）。</p>
                                    <p>「用户」是指注册并使用本平台的任何个人或组织。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">二、上传资格</h3>
                                    <p>您须年满 16 周岁或在监护人同意下方可上传内容。</p>
                                    <p>您须对上传的原理图文件及预览图片拥有合法的所有权或充分的授权。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">三、内容规范</h3>
                                    <p>您保证上传的原理图为您的原创作品，或已获得原作者的明确授权。</p>
                                    <p>严禁上传以下内容：</p>
                                    <ul className="list-disc list-inside space-y-0.5 pl-2 text-muted-foreground">
                                        <li>侵犯他人知识产权的内容；</li>
                                        <li>包含恶意代码或命令方块滥用脚本的文件；</li>
                                        <li>具有歧视性、侮辱性或政治敏感性的建筑；</li>
                                        <li>与 Minecraft 建筑完全无关的文件。</li>
                                    </ul>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">四、知识产权授权</h3>
                                    <p>您保留上传内容的版权。但您在提交原理图的同时，授予本平台全球范围内免费、非独占、可再授权的权利，用于展示、传播、存储及推广您的原理图。</p>
                                    <p>平台不会将您的原理图用于商业销售，但可在社区活动或推广中展示或引用。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">五、侵权投诉</h3>
                                    <p>如您认为平台上的某原理图侵犯了您的版权，可通过平台提供的举报功能或发送邮件至官方邮箱提起投诉。我们将在 7 个工作日内处理有效投诉。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">六、免责声明</h3>
                                    <p>本平台对用户上传的原理图质量、安全性及适用性不作任何保证，使用原理图所产生的任何后果由下载者自行承担。</p>
                                    <p>用户因上传违规内容所引发的法律责任，由上传者本人独立承担，与本平台无关。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">七、协议修改</h3>
                                    <p>本平台保留随时修改本协议的权利。修改后的协议将在平台公告后生效。继续使用本平台即视为接受修改后的协议。</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h3 className="font-semibold text-sm">八、联系我们</h3>
                                    <p>如有任何疑问，欢迎通过平台官方渠道与我们联系。</p>
                                </section>
                            </div>
                            <Shadcn.SheetFooter className="pt-0">
                                <Shadcn.SheetClose asChild>
                                    <Shadcn.Button type="button" className="w-full">
                                        我已阅读，关闭
                                    </Shadcn.Button>
                                </Shadcn.SheetClose>
                            </Shadcn.SheetFooter>
                        </Shadcn.SheetContent>
                    </Shadcn.Sheet>
                </Shadcn.Label>
            </div>

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
