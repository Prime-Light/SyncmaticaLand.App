"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { AuditTable } from "@/components/@prime-light/dashboard/audit-table";
import { AuditDetailDialog } from "@/components/@prime-light/dashboard/audit-detail-dialog";
import { Schematic } from "@/schema";
import { toast } from "sonner";
import { useUpdateSchematic } from "@/hooks";

export interface AuditPageClientProps {
    initialProjects: (Schematic.Schematic.Schematic & { author_name: string })[];
    initialStatusFilter: Schematic.Schematic.ProjectStatus | "all";
}

export function AuditPageClient({ initialProjects, initialStatusFilter }: AuditPageClientProps) {
    const [projects, setProjects] = React.useState(initialProjects);
    const [statusFilter, setStatusFilter] = React.useState<Schematic.Schematic.ProjectStatus | "all">(initialStatusFilter);
    const [selectedProject, setSelectedProject] = React.useState<(Schematic.Schematic.Schematic & { author_name: string }) | null>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [confirmAction, setConfirmAction] = React.useState<"approve" | "reject" | null>(null);
    const [confirmProject, setConfirmProject] = React.useState<(Schematic.Schematic.Schematic & { author_name: string }) | null>(null);

    const { updateSchematic, isLoading: isUpdating } = useUpdateSchematic(confirmProject?.id ?? "");

    const filteredProjects = React.useMemo(() => {
        if (statusFilter === "all") return projects;
        return projects.filter((p) => p.status === statusFilter);
    }, [projects, statusFilter]);

    const handleViewDetails = React.useCallback((project: Schematic.Schematic.Schematic & { author_name: string }) => {
        setSelectedProject(project);
        setDetailOpen(true);
    }, []);

    const handleApprove = React.useCallback((project: Schematic.Schematic.Schematic & { author_name: string }) => {
        setConfirmProject(project);
        setConfirmAction("approve");
        setConfirmDialogOpen(true);
    }, []);

    const handleReject = React.useCallback((project: Schematic.Schematic.Schematic & { author_name: string }) => {
        setConfirmProject(project);
        setConfirmAction("reject");
        setConfirmDialogOpen(true);
    }, []);

    const handleConfirmAction = async () => {
        if (!confirmProject || !confirmAction) return;

        const newStatus = confirmAction === "approve" ? "published" : "rejected";

        try {
            const result = await updateSchematic({ status: newStatus });

            if (result) {
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === confirmProject.id ? { ...p, status: newStatus } : p
                    )
                );
                toast.success(confirmAction === "approve" ? "项目已批准发布" : "项目已拒绝");
                setConfirmDialogOpen(false);
                setConfirmProject(null);
                setConfirmAction(null);
                setDetailOpen(false);
                setSelectedProject(null);
            } else {
                toast.error("操作失败，请重试");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "操作失败，请重试";
            toast.error(message);
        }
    };

    const handleRefresh = React.useCallback(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    React.useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    return (
        <>
            <AuditTable
                projects={filteredProjects}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            <AuditDetailDialog
                project={selectedProject}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onSuccess={handleRefresh}
            />

            <Shadcn.Sheet open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <Shadcn.SheetContent side="bottom" className="sm:max-w-md sm:mx-auto">
                    <Shadcn.SheetHeader>
                        <Shadcn.SheetTitle>
                            {confirmAction === "approve" ? "确认批准" : "确认拒绝"}
                        </Shadcn.SheetTitle>
                        <Shadcn.SheetDescription>
                            {confirmAction === "approve"
                                ? `确定要批准 "${confirmProject?.name}" 吗？批准后项目将公开发布。`
                                : `确定要拒绝 "${confirmProject?.name}" 吗？拒绝后作者可以修改后重新提交。`}
                        </Shadcn.SheetDescription>
                    </Shadcn.SheetHeader>
                    <div className="flex items-center justify-end gap-3 p-4">
                        <Shadcn.Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}>
                            取消
                        </Shadcn.Button>
                        <Shadcn.Button
                            onClick={handleConfirmAction}
                            disabled={isUpdating}
                            variant={confirmAction === "reject" ? "destructive" : "default"}>
                            {isUpdating ? "处理中..." : confirmAction === "approve" ? "批准" : "拒绝"}
                        </Shadcn.Button>
                    </div>
                </Shadcn.SheetContent>
            </Shadcn.Sheet>
        </>
    );
}
