import Link from "next/link";
import * as Shadcn from "@/components/@shadcn-ui";
import { ExternalLinkIcon } from "lucide-react";
import { Schematic } from "@/schema";
import { STATUS_LABELS, STATUS_VARIANTS, formatDate } from "./shared";

export interface RecentActivityProps {
    activities: Array<{
        id: string;
        name: string;
        author_name: string;
        status: Schematic.Schematic.ProjectStatus;
        created_at: string;
    }>;
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
                                    <Shadcn.Badge variant={STATUS_VARIANTS[activity.status]}>
                                        {STATUS_LABELS[activity.status]}
                                    </Shadcn.Badge>
                                </Shadcn.TableCell>
                                <Shadcn.TableCell className="text-muted-foreground">
                                    {formatDate(activity.created_at, true)}
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
