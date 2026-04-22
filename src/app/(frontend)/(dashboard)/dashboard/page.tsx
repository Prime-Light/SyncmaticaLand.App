"use client";

import { useEffect } from "react";
import { Prime } from "@/components";
import { DashboardStats } from "@/components/@prime-light/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/@prime-light/dashboard/recent-projects";
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
                <DashboardStats
                    totalProjects={totalProjects}
                    totalViews={totalViews}
                    totalUpvotes={totalUpvotes}
                    totalStars={totalStars}
                    isLoading={isLoading}
                />
                <RecentProjects projects={recentProjects} isLoading={isLoading} />
            </div>
        </>
    );
}
