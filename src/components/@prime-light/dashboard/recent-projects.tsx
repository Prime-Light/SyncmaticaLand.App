import Link from "next/link";
import { Shadcn } from "@/components";
import { EyeIcon, ThumbsUpIcon, StarIcon, ExternalLinkIcon } from "lucide-react";
import { Schematic } from "@/schema";

export interface RecentProjectsProps {
    projects: Schematic.Schematic.Schematic[];
}

const statusLabels: Record<Schematic.Schematic.ProjectStatus, string> = {
    draft: "草稿",
    published: "已发布",
    under_review: "审核中",
    rejected: "已拒绝",
};

const statusColors: Record<Schematic.Schematic.ProjectStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function RecentProjects({ projects }: RecentProjectsProps) {
    if (projects.length === 0) {
        return (
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>最近项目</Shadcn.CardTitle>
                    <Shadcn.CardDescription>您最近创建或更新的项目</Shadcn.CardDescription>
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
                <Shadcn.CardTitle>最近项目</Shadcn.CardTitle>
                <Shadcn.CardDescription>您最近创建或更新的项目</Shadcn.CardDescription>
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
                            <Shadcn.TableHead className="w-[50px]"></Shadcn.TableHead>
                        </Shadcn.TableRow>
                    </Shadcn.TableHeader>
                    <Shadcn.TableBody>
                        {projects.map((project) => (
                            <Shadcn.TableRow key={project.id}>
                                <Shadcn.TableCell className="font-medium">
                                    <Link
                                        href={`/schematics/${project.id}`}
                                        className="hover:underline">
                                        {project.name}
                                    </Link>
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[project.status]}`}>
                                        {statusLabels[project.status]}
                                    </span>
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
                                <Shadcn.TableCell>
                                    <Link
                                        href={`/schematics/${project.id}`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                                        <ExternalLinkIcon className="h-4 w-4" />
                                    </Link>
                                </Shadcn.TableCell>
                            </Shadcn.TableRow>
                        ))}
                    </Shadcn.TableBody>
                </Shadcn.Table>
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}
