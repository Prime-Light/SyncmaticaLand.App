import * as Shadcn from "@/components/@shadcn-ui";
import { type LucideIcon } from "lucide-react";

interface StatItem {
    title: string;
    value: number;
    icon: LucideIcon;
}

function StatCard({ title, value, icon: Icon }: StatItem) {
    return (
        <Shadcn.Card>
            <Shadcn.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Shadcn.CardTitle className="text-sm font-medium">{title}</Shadcn.CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}

export interface StatsCardsProps {
    stats: StatItem[];
}

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
                <StatCard key={s.title} {...s} />
            ))}
        </div>
    );
}
