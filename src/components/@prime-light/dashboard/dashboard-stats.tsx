import { Shadcn } from "@/components";
import { FolderIcon, EyeIcon, ThumbsUpIcon, StarIcon } from "lucide-react";

export interface DashboardStatsProps {
    totalProjects: number;
    totalViews: number;
    totalUpvotes: number;
    totalStars: number;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Shadcn.Card>
            <Shadcn.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Shadcn.CardTitle className="text-sm font-medium">{title}</Shadcn.CardTitle>
                {icon}
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}

export function DashboardStats({ totalProjects, totalViews, totalUpvotes, totalStars }: DashboardStatsProps) {
    const stats: StatCardProps[] = [
        {
            title: "项目总数",
            value: totalProjects,
            icon: <FolderIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "总浏览量",
            value: totalViews,
            icon: <EyeIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "总点赞数",
            value: totalUpvotes,
            icon: <ThumbsUpIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "总收藏数",
            value: totalStars,
            icon: <StarIcon className="h-4 w-4 text-muted-foreground" />,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))}
        </div>
    );
}
