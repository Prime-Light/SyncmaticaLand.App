import Link from "next/link";
import { Shadcn } from "@/components";
import { ExternalLinkIcon } from "lucide-react";
import { Schematic } from "@/schema";

export interface RecentActivityProps {
    activities: Array<{
        id: string;
        name: string;
        author_name: string;
        status: Schematic.Schematic.ProjectStatus;
        created_at: string;
    }>;
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

export function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
        return (
            <Shadcn.Card>
                <Shadcn.CardHeader>
                    <Shadcn.CardTitle>最近活动</Shadcn.CardTitle>
                    <Shadcn.CardDescription>最近创建的原理图</Shadcn.CardDescription>
                </Shadcn.CardHeader>
                <Shadcn.CardContent>
                    <p className="text-sm text-muted-foreground">暂无活动记录</p>
                </Shadcn.CardContent>
            </Shadcn.Card>
        );
    }

    return (
        <Shadcn.Card>
            <Shadcn.CardHeader>
                <Shadcn.CardTitle>最近活动</Shadcn.CardTitle>
                <Shadcn.CardDescription>最近创建的原理图</Shadcn.CardDescription>
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                <Shadcn.Table>
                    <Shadcn.TableHeader>
                        <Shadcn.TableRow>
                            <Shadcn.TableHead>名称</Shadcn.TableHead>
                            <Shadcn.TableHead>作者</Shadcn.TableHead>
                            <Shadcn.TableHead>状态</Shadcn.TableHead>
                            <Shadcn.TableHead>创建时间</Shadcn.TableHead>
                            <Shadcn.TableHead className="w-[50px]"></Shadcn.TableHead>
                        </Shadcn.TableRow>
                    </Shadcn.TableHeader>
                    <Shadcn.TableBody>
                        {activities.map((activity) => (
                            <Shadcn.TableRow key={activity.id}>
                                <Shadcn.TableCell className="font-medium">
                                    <Link
                                        href={`/schematics/${activity.id}`}
                                        className="hover:underline">
                                        {activity.name}
                                    </Link>
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>{activity.author_name}</Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[activity.status]}`}>
                                        {statusLabels[activity.status]}
                                    </span>
                                </Shadcn.TableCell>
                                <Shadcn.TableCell className="text-muted-foreground">
                                    {formatDate(activity.created_at)}
                                </Shadcn.TableCell>
                                <Shadcn.TableCell>
                                    <Link
                                        href={`/schematics/${activity.id}`}
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
