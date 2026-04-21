"use client";

import { useEffect } from "react";
import { Prime } from "@/components";
import { DashboardStats } from "@/components/@prime-light/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/@prime-light/dashboard/recent-projects";
import { Skeleton } from "@/components/@shadcn-ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSchematics } from "@/hooks/use-schematics";

export default function DashboardPage() {
    const { user, loading: userLoading, refetch: refetchUser } = useCurrentUser();
    const { schematics, isLoading: schematicsLoading, refetch: refetchSchematics } = useSchematics(
        user?.user_id
            ? { author_id: user.user_id, limit: 100, offset: 0 }
            : { skip: true }
    );

    // 每次进入页面都重新获取数据
    useEffect(() => {
        refetchUser();
        refetchSchematics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLoading = userLoading || schematicsLoading;
    const allProjects = schematics?.schematics ?? [];

    const totalProjects = allProjects.length;
    const totalViews = allProjects.reduce((sum, s) => sum + (s.viewed ?? 0), 0);
    const totalUpvotes = allProjects.reduce((sum, s) => sum + (s.upvotes ?? 0), 0);
    const totalStars = allProjects.reduce((sum, s) => sum + (s.starred ?? 0), 0);

    const recentProjects = [...allProjects]
        .sort(
            (a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 5);

    return (
        <>
            <Prime.SiteHeader breadcrumbs={[{ label: "创作者仪表盘" }]} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <DashboardStats
                        totalProjects={totalProjects}
                        totalViews={totalViews}
                        totalUpvotes={totalUpvotes}
                        totalStars={totalStars}
                    />
                )}
                {isLoading ? (
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="space-y-3">
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-4 flex-1" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <RecentProjects projects={recentProjects} />
                )}
            </div>
        </>
    );
}
