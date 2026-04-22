import { UsersIcon, FolderIcon, ClockIcon, EyeIcon } from "lucide-react";
import { StatsCards } from "./stats-cards";

export interface AdminStatsProps {
    totalUsers: number;
    totalSchematics: number;
    pendingReviews: number;
    totalViews: number;
}

export function AdminStats(props: AdminStatsProps) {
    return (
        <StatsCards
            stats={[
                { title: "用户总数", value: props.totalUsers, icon: UsersIcon },
                { title: "原理图总数", value: props.totalSchematics, icon: FolderIcon },
                { title: "待审核", value: props.pendingReviews, icon: ClockIcon },
                { title: "总浏览量", value: props.totalViews, icon: EyeIcon },
            ]}
        />
    );
}
