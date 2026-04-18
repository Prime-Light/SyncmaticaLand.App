"use client";

import * as React from "react";
import { Shadcn } from "@/components";
import { CheckCircleIcon, XCircleIcon, EyeIcon, ThumbsUpIcon, StarIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useUpdateSchematic } from "@/hooks";
import { Schematic } from "@/schema";

const statusLabels: Record<Schematic.Schematic.ProjectStatus, string> = {
    draft: "草稿",
    published: "已发布",
    under_review: "审核中",
    rejected: "已拒绝",
};

const statusVariants: Record<Schematic.Schematic.ProjectStatus, "secondary" | "default" | "outline" | "destructive"> = {
    draft: "secondary",
    published: "default",
    under_review: "outline",
    rejected: "destructive",
};

const formatLabels: Record<Schematic.Schematic.ProjectFormat, string> = {
    litematic: "Litematic",
    schem: "Schematic",
    nbt: "NBT",
    bp: "Bedrock Pack",
};

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export interface AuditDetailDialogProps {
    project: (Schematic.Schematic.Schematic & { author_name: string }) | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AuditDetailDialog({ project, open, onOpenChange, onSuccess }: AuditDetailDialogProps) {
    const { updateSchematic, isLoading: isUpdating } = useUpdateSchematic(project?.id ?? "");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleStatusUpdate = async (newStatus: "published" | "rejected") => {
        if (!project) return;

        setIsSubmitting(true);
        try {
            const result = await updateSchematic({ status: newStatus });

            if (result) {
                toast.success(newStatus === "published" ? "项目已批准发布" : "项目已拒绝");
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error("操作失败，请重试");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "操作失败，请重试";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    const isUnderReview = project.status === "under_review";

    return (
        <Shadcn.Sheet open={open} onOpenChange={onOpenChange}>
            <Shadcn.SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                <Shadcn.SheetHeader className="pb-2">
                    <Shadcn.SheetTitle className="text-base font-semibold">
                        项目详情
                    </Shadcn.SheetTitle>
                    <Shadcn.SheetDescription>
                        查看原理图详细信息并进行审核操作
                    </Shadcn.SheetDescription>
                </Shadcn.SheetHeader>

                <div className="flex flex-1 flex-col gap-6 p-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">作者: {project.author_name}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Shadcn.Badge variant={statusVariants[project.status]}>
                                {statusLabels[project.status]}
                            </Shadcn.Badge>
                            <Shadcn.Badge variant="secondary">
                                {formatLabels[project.format]}
                            </Shadcn.Badge>
                            <Shadcn.Badge variant="outline">
                                MC {project.mc_version}
                            </Shadcn.Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{project.viewed.toLocaleString()} 浏览</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <ThumbsUpIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{project.upvotes.toLocaleString()} 点赞</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <StarIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{project.starred.toLocaleString()} 收藏</span>
                            </div>
                        </div>

                        {project.description && (
                            <div>
                                <h4 className="mb-1 text-sm font-medium">描述</h4>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {project.description}
                                </p>
                            </div>
                        )}

                        {project.tags && project.tags.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium">标签</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags.map((tag) => (
                                        <Shadcn.Badge key={tag} variant="secondary">
                                            {tag}
                                        </Shadcn.Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.images && project.images.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium">预览图片</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {project.images.map((url, index) => (
                                        <div
                                            key={`image-${index}`}
                                            className="relative aspect-video overflow-hidden border border-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={url}
                                                alt={`预览图片 ${index + 1}`}
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!project.images || project.images.length === 0) && (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                                <p className="text-sm">暂无预览图片</p>
                            </div>
                        )}

                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>创建时间: {formatDate(project.created_at)}</p>
                            <p>更新时间: {formatDate(project.updated_at)}</p>
                        </div>
                    </div>

                    {isUnderReview && (
                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Shadcn.Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}>
                                取消
                            </Shadcn.Button>
                            <Shadcn.Button
                                variant="destructive"
                                disabled={isSubmitting || isUpdating}
                                onClick={() => handleStatusUpdate("rejected")}>
                                {isSubmitting || isUpdating ? (
                                    "处理中..."
                                ) : (
                                    <>
                                        <XCircleIcon />
                                        拒绝
                                    </>
                                )}
                            </Shadcn.Button>
                            <Shadcn.Button
                                disabled={isSubmitting || isUpdating}
                                onClick={() => handleStatusUpdate("published")}>
                                {isSubmitting || isUpdating ? (
                                    "处理中..."
                                ) : (
                                    <>
                                        <CheckCircleIcon />
                                        批准
                                    </>
                                )}
                            </Shadcn.Button>
                        </div>
                    )}
                </div>
            </Shadcn.SheetContent>
        </Shadcn.Sheet>
    );
}
