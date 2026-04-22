import { FolderIcon, EyeIcon, ThumbsUpIcon, StarIcon } from "lucide-react";
import * as Shadcn from "@/components/@shadcn-ui";
import { StatsCards } from "./stats-cards";

export interface DashboardStatsProps {
    totalProjects: number;
    totalViews: number;
    totalUpvotes: number;
    totalStars: number;
    isLoading?: boolean;
}

export function DashboardStats(props: DashboardStatsProps) {
    if (props.isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Shadcn.Card key={i}>
                        <Shadcn.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Shadcn.Skeleton className="h-4 w-20" />
                            <Shadcn.Skeleton className="size-4" />
                        </Shadcn.CardHeader>
                        <Shadcn.CardContent>
                            <Shadcn.Skeleton className="h-8 w-16" />
                        </Shadcn.CardContent>
                    </Shadcn.Card>
                ))}
            </div>
        );
    }

    return (
        <StatsCards
            stats={[
                { title: "项目总数", value: props.totalProjects, icon: FolderIcon },
                { title: "总浏览量", value: props.totalViews, icon: EyeIcon },
                { title: "总点赞数", value: props.totalUpvotes, icon: ThumbsUpIcon },
                { title: "总收藏数", value: props.totalStars, icon: StarIcon },
            ]}
        />
    );
}
