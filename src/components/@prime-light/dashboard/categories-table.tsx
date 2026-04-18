"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";
import { Schematic } from "@/schema";

export interface CategoriesTableProps {
    categories: Schematic.Category.Category[];
    onEdit: (category: Schematic.Category.Category) => void;
    onDelete: (category: Schematic.Category.Category) => void;
    onUpdate: (id: string, data: Schematic.Category.UpdateCategoryReq) => Promise<boolean>;
}

interface EditableCellProps {
    value: string | null;
    onSave: (value: string) => Promise<unknown>;
    placeholder?: string;
    multiline?: boolean;
}

function EditableCell({
    value,
    onSave,
    placeholder = "点击编辑",
    multiline = false,
}: EditableCellProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(value ?? "");
    const [isSaving, setIsSaving] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (editValue === (value ?? "")) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
        } catch {
            setEditValue(value ?? "");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value ?? "");
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (!isEditing) {
        return (
            <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full rounded px-2 py-1 text-left hover:bg-muted/50">
                {value || <span className="text-muted-foreground">{placeholder}</span>}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {multiline ? (
                <Shadcn.Textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="min-h-16 resize-none"
                    autoFocus
                />
            ) : (
                <Shadcn.Input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className="h-8"
                    autoFocus
                />
            )}
            <Shadcn.Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                disabled={isSaving}
                className="shrink-0">
                <CheckIcon className="h-4 w-4 text-green-600" />
            </Shadcn.Button>
            <Shadcn.Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="shrink-0">
                <XIcon className="h-4 w-4 text-red-600" />
            </Shadcn.Button>
        </div>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export function CategoriesTable({
    categories,
    onEdit,
    onDelete,
    onUpdate,
}: CategoriesTableProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;

    const totalPages = Math.ceil(categories.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCategories = categories.slice(startIndex, endIndex);

    if (categories.length === 0) {
        return (
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>分类管理</Shadcn.CardTitle>
                    <Shadcn.CardDescription>管理所有原理图分类</Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <p className="text-sm text-muted-foreground">暂无分类</p>
                </Shadcn.CardContent>
            </Shadcn.Card>
        );
    }

    const handleFieldUpdate = async (
        id: string,
        field: keyof Schematic.Category.UpdateCategoryReq,
        value: string
    ) => {
        const data: Schematic.Category.UpdateCategoryReq = { [field]: value || null };
        return await onUpdate(id, data);
    };

    return (
        <Shadcn.Card>
            <Shadcn.CardHeader>
                <Shadcn.CardTitle>分类管理</Shadcn.CardTitle>
                <Shadcn.CardDescription>共 {categories.length} 个分类</Shadcn.CardDescription>
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                <Shadcn.Table>
                    <Shadcn.TableHeader>
                        <Shadcn.TableRow>
                            <Shadcn.TableHead>名称</Shadcn.TableHead>
                            <Shadcn.TableHead>Slug</Shadcn.TableHead>
                            <Shadcn.TableHead className="min-w-48">描述</Shadcn.TableHead>
                            <Shadcn.TableHead>图标 URL</Shadcn.TableHead>
                            <Shadcn.TableHead>创建时间</Shadcn.TableHead>
                            <Shadcn.TableHead className="w-[60px]"></Shadcn.TableHead>
                        </Shadcn.TableRow>
                    </Shadcn.TableHeader>
                    <Shadcn.TableBody>
                        {paginatedCategories.map((category) => (
                            <Shadcn.TableRow key={category.id}>
                                <Shadcn.TableCell className="font-medium">
                                    <EditableCell
                                        value={category.name}
                                        onSave={(value) =>
                                            handleFieldUpdate(category.id, "name", value)
                                        }
                                    />
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                                        {category.slug}
                                    </code>
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <EditableCell
                                        value={category.description}
                                        onSave={(value) =>
                                            handleFieldUpdate(category.id, "description", value)
                                        }
                                        placeholder="添加描述"
                                        multiline
                                    />
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <EditableCell
                                        value={category.icon_url}
                                        onSave={(value) =>
                                            handleFieldUpdate(category.id, "icon_url", value)
                                        }
                                        placeholder="添加图标 URL"
                                    />
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    {formatDate(category.created_at)}
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <Shadcn.DropdownMenu>
                                        <Shadcn.DropdownMenuTrigger asChild>
                                            <Shadcn.Button variant="ghost" size="icon-sm">
                                                <MoreHorizontalIcon />
                                                <span className="sr-only">操作菜单</span>
                                            </Shadcn.Button>
                                        </Shadcn.DropdownMenuTrigger>
                                        <Shadcn.DropdownMenuContent align="end">
                                            <Shadcn.DropdownMenuItem
                                                onClick={() => onEdit(category)}>
                                                <PencilIcon />
                                                编辑
                                            </Shadcn.DropdownMenuItem>
                                            <Shadcn.DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => onDelete(category)}>
                                                <Trash2Icon />
                                                删除
                                            </Shadcn.DropdownMenuItem>
                                        </Shadcn.DropdownMenuContent>
                                    </Shadcn.DropdownMenu>
                                </Shadcn.TableCell>
                            </Shadcn.TableRow>
                        ))}
                    </Shadcn.TableBody>
                </Shadcn.Table>

                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            第 {currentPage} 页，共 {totalPages} 页
                        </p>
                        <div className="flex gap-2">
                            <Shadcn.Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}>
                                上一页
                            </Shadcn.Button>
                            <Shadcn.Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}>
                                下一页
                            </Shadcn.Button>
                        </div>
                    </div>
                )}
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}
