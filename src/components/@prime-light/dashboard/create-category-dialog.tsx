"use client";

import * as React from "react";
import * as Shadcn from "@/components/@shadcn-ui";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useCreateCategory } from "@/hooks";
import { Schematic } from "@/schema";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function validateSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug);
}

export interface CreateCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateCategoryDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateCategoryDialogProps) {
    const { createCategory, isLoading } = useCreateCategory();

    const [name, setName] = React.useState("");
    const [slug, setSlug] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [iconUrl, setIconUrl] = React.useState("");
    const [isAutoSlug, setIsAutoSlug] = React.useState(true);
    const [slugError, setSlugError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setName("");
            setSlug("");
            setDescription("");
            setIconUrl("");
            setIsAutoSlug(true);
            setSlugError(null);
        }
    }, [open]);

    React.useEffect(() => {
        if (isAutoSlug) {
            setSlug(generateSlug(name));
        }
    }, [name, isAutoSlug]);

    const handleSlugChange = (value: string) => {
        setSlug(value);
        setIsAutoSlug(false);

        if (value && !validateSlug(value)) {
            setSlugError("Slug 只能包含小写字母、数字和连字符");
        } else {
            setSlugError(null);
        }
    };

    const isFormValid = name.trim().length > 0 && slug.trim().length > 0 && !slugError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const data: Schematic.Category.CreateCategoryReq = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            icon_url: iconUrl.trim() || null,
        };

        const result = await createCategory(data);

        if (result) {
            toast.success("分类创建成功！");
            onOpenChange(false);
            onSuccess();
        } else {
            toast.error("创建分类失败，请重试");
        }
    };

    return (
        <Shadcn.Sheet open={open} onOpenChange={onOpenChange}>
            <Shadcn.SheetTrigger asChild>
                <Shadcn.Button>
                    <PlusIcon />
                    新建分类
                </Shadcn.Button>
            </Shadcn.SheetTrigger>
            <Shadcn.SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                <Shadcn.SheetHeader className="pb-2">
                    <Shadcn.SheetTitle className="text-base font-semibold">
                        新建分类
                    </Shadcn.SheetTitle>
                    <Shadcn.SheetDescription>创建一个新的原理图分类</Shadcn.SheetDescription>
                </Shadcn.SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4">
                    <Shadcn.FieldGroup>
                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="category-name">
                                <span>
                                    名称<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Input
                                id="category-name"
                                placeholder="分类名称"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="category-slug">
                                <span>
                                    Slug<span className="text-destructive">*</span>
                                </span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Input
                                id="category-slug"
                                placeholder="url-friendly-identifier"
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                className={slugError ? "border-destructive" : ""}
                            />
                            {slugError && (
                                <p className="text-sm text-destructive">{slugError}</p>
                            )}
                            <Shadcn.FieldDescription>
                                用于 URL 路由，只能包含小写字母、数字和连字符
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="category-description">
                                <span>描述</span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Textarea
                                id="category-description"
                                placeholder="分类描述（可选）"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-20"
                            />
                        </Shadcn.Field>

                        <Shadcn.Field>
                            <Shadcn.FieldLabel htmlFor="category-icon">
                                <span>图标 URL</span>
                            </Shadcn.FieldLabel>
                            <Shadcn.Input
                                id="category-icon"
                                placeholder="https://example.com/icon.png"
                                value={iconUrl}
                                onChange={(e) => setIconUrl(e.target.value)}
                            />
                            <Shadcn.FieldDescription>
                                分类图标的 URL 地址（可选）
                            </Shadcn.FieldDescription>
                        </Shadcn.Field>
                    </Shadcn.FieldGroup>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Shadcn.Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            取消
                        </Shadcn.Button>
                        <Shadcn.Button type="submit" disabled={!isFormValid || isLoading}>
                            {isLoading ? "创建中..." : "创建"}
                        </Shadcn.Button>
                    </div>
                </form>
            </Shadcn.SheetContent>
        </Shadcn.Sheet>
    );
}
