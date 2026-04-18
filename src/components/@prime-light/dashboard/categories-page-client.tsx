"use client";

import * as React from "react";
import { CategoriesTable } from "@/components/@prime-light/dashboard/categories-table";
import { CreateCategoryDialog } from "@/components/@prime-light/dashboard/create-category-dialog";
import { DeleteCategoryDialog } from "@/components/@prime-light/dashboard/delete-category-dialog";
import { Schematic } from "@/schema";
import { toast } from "sonner";
import { useUpdateCategory } from "@/hooks";

export interface CategoriesPageClientProps {
    initialCategories: Schematic.Category.Category[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
    const [categories, setCategories] = React.useState(initialCategories);
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Schematic.Category.Category | null>(null);
    const [updatingCategoryId, setUpdatingCategoryId] = React.useState<string | null>(null);

    const { updateCategory } = useUpdateCategory(updatingCategoryId ?? "");

    const handleEdit = React.useCallback((category: Schematic.Category.Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    }, []);

    const handleDelete = React.useCallback((category: Schematic.Category.Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    }, []);

    const handleUpdate = React.useCallback(async (id: string, data: Schematic.Category.UpdateCategoryReq): Promise<boolean> => {
        setUpdatingCategoryId(id);

        try {
            const result = await updateCategory(data);

            if (result) {
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === id
                            ? { ...c, ...result.category }
                            : c
                    )
                );
                toast.success("分类更新成功");
                return true;
            } else {
                toast.error("更新分类失败");
                return false;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "更新失败，请重试";
            toast.error(message);
            return false;
        } finally {
            setUpdatingCategoryId(null);
        }
    }, [updateCategory]);

    const handleCreateSuccess = React.useCallback(() => {
        window.location.reload();
    }, []);

    const handleDeleteSuccess = React.useCallback(() => {
        if (selectedCategory) {
            setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
        }
        setSelectedCategory(null);
    }, [selectedCategory]);

    React.useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">分类管理</h2>
                    <p className="text-sm text-muted-foreground">管理所有原理图分类</p>
                </div>
                <CreateCategoryDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSuccess={handleCreateSuccess}
                />
            </div>

            <CategoriesTable
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />

            <DeleteCategoryDialog
                category={selectedCategory}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}
