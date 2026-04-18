import { Shadcn } from "@/components";
import { UsersIcon, FolderIcon, ClockIcon, EyeIcon } from "lucide-react";

export interface AdminStatsProps {
    totalUsers: number;
    totalSchematics: number;
    pendingReviews: number;
    totalViews: number;
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

export function AdminStats({ totalUsers, totalSchematics, pendingReviews, totalViews }: AdminStatsProps) {
    const stats: StatCardProps[] = [
        {
            title: "用户总数",
            value: totalUsers,
            icon: <UsersIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "原理图总数",
            value: totalSchematics,
            icon: <FolderIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "待审核",
            value: pendingReviews,
            icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
        },
        {
            title: "总浏览量",
            value: totalViews,
            icon: <EyeIcon className="h-4 w-4 text-muted-foreground" />,
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
