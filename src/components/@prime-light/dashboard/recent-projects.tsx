import Link from "next/link";
import { Shadcn } from "@/components";
import { EyeIcon, ThumbsUpIcon, StarIcon, ExternalLinkIcon } from "lucide-react";
import { Schematic } from "@/schema";
import { STATUS_LABELS, STATUS_VARIANTS } from "./shared";

export interface RecentProjectsProps {
    projects: Schematic.Schematic.Schematic[];
}

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
