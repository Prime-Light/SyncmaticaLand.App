"use client";

import * as React from "react";
import Link from "next/link";
import { Shadcn } from "@/components";
import {
    EyeIcon,
    ThumbsUpIcon,
    MoreHorizontalIcon,
    CheckCircleIcon,
    XCircleIcon,
    SearchIcon,
} from "lucide-react";
import { Schematic } from "@/schema";
import { STATUS_LABELS, STATUS_VARIANTS, formatDate } from "./shared";

export interface AuditTableProps {
    projects: (Schematic.Schematic.Schematic & { author_name: string })[];
    onViewDetails: (project: Schematic.Schematic.Schematic & { author_name: string }) => void;
    onApprove: (project: Schematic.Schematic.Schematic & { author_name: string }) => void;
    onReject: (project: Schematic.Schematic.Schematic & { author_name: string }) => void;
    statusFilter: Schematic.Schematic.ProjectStatus | "all";
    onStatusFilterChange: (status: Schematic.Schematic.ProjectStatus | "all") => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
}

export function AuditTable({
    projects,
    onViewDetails,
    onApprove,
    onReject,
    statusFilter,
    onStatusFilterChange,
    selectedIds,
    onSelectionChange,
}: AuditTableProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState("");
    const pageSize = 10;

    const filteredProjects = React.useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.author_name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        );
    }, [projects, searchQuery]);

    const totalPages = Math.ceil(filteredProjects.length / pageSize);
    const paginated = filteredProjects.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const allSelected = paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id));
    const someSelected = paginated.some((p) => selectedIds.has(p.id));

    const handleToggleAll = () => {
        if (allSelected) {
            const newIds = new Set(selectedIds);
            paginated.forEach((p) => newIds.delete(p.id));
            onSelectionChange(newIds);
        } else {
            const newIds = new Set(selectedIds);
            paginated.forEach((p) => newIds.add(p.id));
            onSelectionChange(newIds);
        }
    };

    const handleToggleOne = (id: string) => {
        const newIds = new Set(selectedIds);
        if (newIds.has(id)) {
            newIds.delete(id);
        } else {
            newIds.add(id);
        }
        onSelectionChange(newIds);
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery]);

    return (
        <Shadcn.Card>
            <Shadcn.CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Shadcn.CardTitle>项目管理</Shadcn.CardTitle>
                        <Shadcn.CardDescription>
                            共 {filteredProjects.length} 个项目
                            {selectedIds.size > 0 && `，已选择 ${selectedIds.size} 个`}
                        </Shadcn.CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Shadcn.Input
                                placeholder="搜索项目..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Shadcn.Select
                            value={statusFilter}
                            onValueChange={(v) =>
                                onStatusFilterChange(
                                    v as Schematic.Schematic.ProjectStatus | "all"
                                )
                            }>
                            <Shadcn.SelectTrigger className="w-[140px]">
                                <Shadcn.SelectValue placeholder="筛选状态" />
                            </Shadcn.SelectTrigger>
                            <Shadcn.SelectContent>
                                <Shadcn.SelectItem value="all">全部状态</Shadcn.SelectItem>
                                <Shadcn.SelectItem value="under_review">
                                    审核中
                                </Shadcn.SelectItem>
                                <Shadcn.SelectItem value="published">已发布</Shadcn.SelectItem>
                                <Shadcn.SelectItem value="rejected">已拒绝</Shadcn.SelectItem>
                                <Shadcn.SelectItem value="draft">草稿</Shadcn.SelectItem>
                            </Shadcn.SelectContent>
                        </Shadcn.Select>
                    </div>
                </div>
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                {projects.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        暂无待审核项目
                    </p>
                ) : (
                    <>
                        <Shadcn.Table>
                            <Shadcn.TableHeader>
                                <Shadcn.TableRow>
                                    <Shadcn.TableHead className="w-[40px]">
                                        <Shadcn.Checkbox
                                            checked={
                                                allSelected
                                                    ? true
                                                    : someSelected
                                                      ? "indeterminate"
                                                      : false
                                            }
                                            onCheckedChange={handleToggleAll}
                                        />
                                    </Shadcn.TableHead>
                                    <Shadcn.TableHead>名称</Shadcn.TableHead>
                                    <Shadcn.TableHead>作者</Shadcn.TableHead>
                                    <Shadcn.TableHead>状态</Shadcn.TableHead>
                                    <Shadcn.TableHead className="text-center">
                                        浏览
                                    </Shadcn.TableHead>
                                    <Shadcn.TableHead className="text-center">
                                        点赞
                                    </Shadcn.TableHead>
                                    <Shadcn.TableHead>创建时间</Shadcn.TableHead>
                                    <Shadcn.TableHead className="w-[60px]"></Shadcn.TableHead>
                                </Shadcn.TableRow>
                            </Shadcn.TableHeader>
                            <Shadcn.TableBody>
                                {paginated.map((project) => {
                                    const isUnderReview = project.status === "under_review";
                                    const isSelected = selectedIds.has(project.id);
                                    return (
                                        <Shadcn.TableRow
                                            key={project.id}
                                            data-selected={isSelected}>
                                            <Shadcn.TableCell>
                                                <Shadcn.Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        handleToggleOne(project.id)
                                                    }
                                                />
                                            </Shadcn.TableCell>
                                            <Shadcn.TableCell className="font-medium">
                                                <Link
                                                    href={`/schematics/${project.id}`}
                                                    className="hover:underline">
                                                    {project.name}
                                                </Link>
                                            </Shadcn.TableCell>
                                            <Shadcn.TableCell>
                                                {project.author_name}
                                            </Shadcn.TableCell>
                                            <Shadcn.TableCell>
                                                <Shadcn.Badge
                                                    variant={STATUS_VARIANTS[project.status]}>
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
                                            <Shadcn.TableCell>
                                                {formatDate(project.created_at)}
                                            </Shadcn.TableCell>
                                            <Shadcn.TableCell>
                                                <Shadcn.DropdownMenu>
                                                    <Shadcn.DropdownMenuTrigger asChild>
                                                        <Shadcn.Button
                                                            variant="ghost"
                                                            size="icon-sm">
                                                            <MoreHorizontalIcon />
                                                            <span className="sr-only">
                                                                操作菜单
                                                            </span>
                                                        </Shadcn.Button>
                                                    </Shadcn.DropdownMenuTrigger>
                                                    <Shadcn.DropdownMenuContent align="end">
                                                        <Shadcn.DropdownMenuItem
                                                            onClick={() =>
                                                                onViewDetails(project)
                                                            }>
                                                            查看详情
                                                        </Shadcn.DropdownMenuItem>
                                                        {isUnderReview && (
                                                            <>
                                                                <Shadcn.DropdownMenuItem
                                                                    onClick={() =>
                                                                        onApprove(project)
                                                                    }>
                                                                    <CheckCircleIcon />
                                                                    批准
                                                                </Shadcn.DropdownMenuItem>
                                                                <Shadcn.DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        onReject(project)
                                                                    }>
                                                                    <XCircleIcon />
                                                                    拒绝
                                                                </Shadcn.DropdownMenuItem>
                                                            </>
                                                        )}
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
                    </>
                )}
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}
