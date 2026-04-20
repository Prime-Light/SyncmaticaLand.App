"use client";

import * as React from "react";
import * as Shadcn from "@/components/@shadcn-ui";
import { toast } from "sonner";
import { useDeleteCategory } from "@/hooks";
import { Schematic } from "@/schema";

export interface DeleteCategoryDialogProps {
    category: Schematic.Category.Category | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteCategoryDialog({
    category,
    open,
    onOpenChange,
    onSuccess,
}: DeleteCategoryDialogProps) {
    const { deleteCategory, isLoading } = useDeleteCategory(category?.id ?? "");

    const handleDelete = async () => {
        if (!category) return;

        const result = await deleteCategory();

        if (result) {
            toast.success(`分类 "${category.name}" 已删除`);
            onOpenChange(false);
            onSuccess();
        } else {
            toast.error("删除分类失败，请重试");
        }
    };

    return (
        <Shadcn.Sheet open={open} onOpenChange={onOpenChange}>
            <Shadcn.SheetContent side="bottom" className="sm:mx-auto sm:max-w-md">
                <Shadcn.SheetHeader>
                    <Shadcn.SheetTitle>确认删除</Shadcn.SheetTitle>
                    <Shadcn.SheetDescription>
                        确定要删除分类 <strong>&ldquo;{category?.name}&rdquo;</strong>{" "}
                        吗？此操作无法撤销。
                    </Shadcn.SheetDescription>
                </Shadcn.SheetHeader>
                <div className="flex items-center justify-end gap-3 p-4">
                    <Shadcn.Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}>
                        取消
                    </Shadcn.Button>
                    <Shadcn.Button
                        onClick={handleDelete}
                        disabled={isLoading}
                        variant="destructive">
                        {isLoading ? "删除中..." : "删除"}
                    </Shadcn.Button>
                </div>
            </Shadcn.SheetContent>
        </Shadcn.Sheet>
    );
}
