"use client";

import * as React from "react";
import Link from "next/link";
import { Shadcn } from "@/components";
import { EyeIcon, ThumbsUpIcon, StarIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Schematic } from "@/schema";
import { STATUS_LABELS, STATUS_VARIANTS, formatDate } from "./shared";

export interface ProjectsTableProps {
    projects: Schematic.Schematic.Schematic[];
    currentUserId: string;
    onEdit: (project: Schematic.Schematic.Schematic) => void;
    onDelete: (project: Schematic.Schematic.Schematic) => void;
}

function canEdit(status: Schematic.Schematic.ProjectStatus): boolean {
    return status === "draft" || status === "under_review" || status === "rejected" || status === "published";
}

function canDelete(_status: Schematic.Schematic.ProjectStatus, authorId: string, currentUserId: string): boolean {
    return authorId === currentUserId;
}

export function ProjectsTable({ projects, currentUserId, onEdit, onDelete }: ProjectsTableProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;

    const totalPages = Math.ceil(projects.length / pageSize);
    const paginated = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (projects.length === 0) {
        return (
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>我的项目</Shadcn.CardTitle>
                    <Shadcn.CardDescription>管理您的所有原理图项目</Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <p className="text-sm text-muted-foreground">暂无项目</p>
                </Shadcn.CardContent>
            </Shadcn.Card>
        );
    }

    return (
        <Shadcn.Card>
            <Shadcn.CardHeader>
                <Shadcn.CardTitle>我的项目</Shadcn.CardTitle>
                <Shadcn.CardDescription>共 {projects.length} 个项目</Shadcn.CardDescription>
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                <Shadcn.Table>
                    <Shadcn.TableHeader>
                        <Shadcn.TableRow>
                            <Shadcn.TableHead>名称</Shadcn.TableHead>
                            <Shadcn.TableHead>状态</Shadcn.TableHead>
                            <Shadcn.TableHead className="text-center">浏览</Shadcn.TableHead>
                            <Shadcn.TableHead className="text-center">点赞</Shadcn.TableHead>
                            <Shadcn.TableHead className="text-center">收藏</Shadcn.TableHead>
                            <Shadcn.TableHead>创建时间</Shadcn.TableHead>
                            <Shadcn.TableHead className="w-[60px]"></Shadcn.TableHead>
                        </Shadcn.TableRow>
                    </Shadcn.TableHeader>
                    <Shadcn.TableBody>
                        {paginated.map((project) => {
                            const editable = canEdit(project.status);
                            const deletable = canDelete(project.status, project.author_id, currentUserId);
                            return (
                                <Shadcn.TableRow key={project.id}>
                                    <Shadcn.TableCell className="font-medium">
                                        <Link href={`/schematics/${project.id}`} className="hover:underline">
                                            {project.name}
                                        </Link>
                                    </Shadcn.TableCell>
                                    <Shadcn.TableCell>
                                        <Shadcn.Badge variant={STATUS_VARIANTS[project.status]}>
                                            {STATUS_LABELS[project.status]}
                                        </Shadcn.Badge>
                                    </Shadcn.TableCell>
                                    <Shadcn.TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1">
                                            <EyeIcon className="h-3 w-3" />
                                            {project.viewed.toLocaleString()}
                                        </span>
                                    </Shadcn.TableCell>
                                    <Shadcn.TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1">
                                            <ThumbsUpIcon className="h-3 w-3" />
                                            {project.upvotes.toLocaleString()}
                                        </span>
                                    </Shadcn.TableCell>
                                    <Shadcn.TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1">
                                            <StarIcon className="h-3 w-3" />
                                            {project.starred.toLocaleString()}
                                        </span>
                                    </Shadcn.TableCell>
                                    <Shadcn.TableCell>{formatDate(project.created_at)}</Shadcn.TableCell>
                                    <Shadcn.TableCell>
                                        <Shadcn.DropdownMenu>
                                            <Shadcn.DropdownMenuTrigger asChild>
                                                <Shadcn.Button variant="ghost" size="icon-sm">
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">操作菜单</span>
                                                </Shadcn.Button>
                                            </Shadcn.DropdownMenuTrigger>
                                            <Shadcn.DropdownMenuContent align="end">
                                                <Shadcn.DropdownMenuGroup>
                                                    <Shadcn.DropdownMenuItem
                                                        disabled={!editable}
                                                        onClick={() => editable && onEdit(project)}>
                                                        <PencilIcon />
                                                        编辑
                                                    </Shadcn.DropdownMenuItem>
                                                    <Shadcn.DropdownMenuItem
                                                        variant="destructive"
                                                        disabled={!deletable}
                                                        onClick={() => deletable && onDelete(project)}>
                                                        <Trash2Icon />
                                                        删除
                                                    </Shadcn.DropdownMenuItem>
                                                </Shadcn.DropdownMenuGroup>
                                            </Shadcn.DropdownMenuContent>
                                        </Shadcn.DropdownMenu>
                                    </Shadcn.TableCell>
                                </Shadcn.TableRow>
                            );
                        })}
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
