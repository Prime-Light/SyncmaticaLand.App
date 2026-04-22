"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDeleteSchematic } from "@/hooks";
import { Schematic } from "@/schema";
import { ProjectsTable } from "./projects-table";
import { EditProjectDialog } from "./edit-project-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/@shadcn-ui/alert-dialog";

export interface ProjectsPageClientProps {
    projects: Schematic.Schematic.Schematic[];
    currentUserId: string;
    isLoading?: boolean;
    onRefetch?: () => void;
}

export function ProjectsPageClient({
    projects: initialProjects,
    currentUserId,
    isLoading,
    onRefetch,
}: ProjectsPageClientProps) {
    const [projects, setProjects] = React.useState(initialProjects);

    React.useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);
    const [editingProject, setEditingProject] =
        React.useState<Schematic.Schematic.Schematic | null>(null);
    const [deletingProject, setDeletingProject] =
        React.useState<Schematic.Schematic.Schematic | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const { deleteSchematic, isLoading: isDeleting } = useDeleteSchematic(
        deletingProject?.id ?? ""
    );

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
        onRefetch?.();
    }, [onRefetch]);

    return (
        <>
            <ProjectsTable
                projects={projects}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
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

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除项目{" "}
                            <span className="font-medium text-foreground">
                                &ldquo;{deletingProject?.name}&rdquo;
                            </span>{" "}
                            吗？此操作无法撤销，删除后将无法恢复。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}>
                            {isDeleting ? "删除中..." : "确认删除"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
