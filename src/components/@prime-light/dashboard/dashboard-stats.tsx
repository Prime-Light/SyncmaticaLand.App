import { FolderIcon, EyeIcon, ThumbsUpIcon, StarIcon } from "lucide-react";
import { StatsCards } from "./stats-cards";

export interface DashboardStatsProps {
    totalProjects: number;
    totalViews: number;
    totalUpvotes: number;
    totalStars: number;
}

export function DashboardStats(props: DashboardStatsProps) {
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
