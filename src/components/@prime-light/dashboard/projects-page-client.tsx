"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shadcn } from "@/components";
import { toast } from "sonner";
import { useDeleteSchematic } from "@/hooks";
import { Schematic } from "@/schema";
import { ProjectsTable } from "./projects-table";
import { EditProjectDialog } from "./edit-project-dialog";

export interface ProjectsPageClientProps {
    projects: Schematic.Schematic.Schematic[];
    currentUserId: string;
}

export function ProjectsPageClient({ projects: initialProjects, currentUserId }: ProjectsPageClientProps) {
    const router = useRouter();
    const [projects, setProjects] = React.useState(initialProjects);
    const [editingProject, setEditingProject] = React.useState<Schematic.Schematic.Schematic | null>(null);
    const [deletingProject, setDeletingProject] = React.useState<Schematic.Schematic.Schematic | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const { deleteSchematic, isLoading: isDeleting } = useDeleteSchematic(deletingProject?.id ?? "");

    const handleEdit = React.useCallback((project: Schematic.Schematic.Schematic) => {
        setEditingProject(project);
        setIsEditDialogOpen(true);
    }, []);

    const handleDelete = React.useCallback((project: Schematic.Schematic.Schematic) => {
        setDeletingProject(project);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = React.useCallback(async () => {
        if (!deletingProject) return;

        try {
            const success = await deleteSchematic();
            if (success) {
                toast.success("项目已删除");
                setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
                setIsDeleteDialogOpen(false);
                setDeletingProject(null);
            } else {
                toast.error("删除失败，请重试");
            }
        } catch {
            toast.error("删除失败，请重试");
        }
    }, [deletingProject, deleteSchematic]);

    const handleEditSuccess = React.useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <>
            <ProjectsTable
                projects={projects}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <EditProjectDialog
                project={editingProject}
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingProject(null);
                }}
                onSuccess={handleEditSuccess}
            />

            <Shadcn.Sheet open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Shadcn.SheetContent side="right" className="w-full sm:max-w-sm">
                    <Shadcn.SheetHeader className="pb-2">
                        <Shadcn.SheetTitle className="text-base font-semibold">
                            确认删除
                        </Shadcn.SheetTitle>
                        <Shadcn.SheetDescription>
                            此操作无法撤销
                        </Shadcn.SheetDescription>
                    </Shadcn.SheetHeader>

                    <div className="flex flex-col gap-4 p-4">
                        <p className="text-sm text-muted-foreground">
                            确定要删除项目 <span className="font-medium text-foreground">&ldquo;{deletingProject?.name}&rdquo;</span> 吗？删除后将无法恢复。
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <Shadcn.Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}>
                                取消
                            </Shadcn.Button>
                            <Shadcn.Button
                                type="button"
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={confirmDelete}>
                                {isDeleting ? "删除中..." : "确认删除"}
                            </Shadcn.Button>
                        </div>
                    </div>
                </Shadcn.SheetContent>
            </Shadcn.Sheet>
        </>
    );
}
