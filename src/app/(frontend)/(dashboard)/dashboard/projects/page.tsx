"use client";

import { useEffect } from "react";
import { Prime } from "@/components";
import { ProjectsPageClient } from "@/components/@prime-light/dashboard/projects-page-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSchematics } from "@/hooks/use-schematics";

export default function ProjectsPage() {
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

    const sortedSchematics = [...allProjects].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[{ label: "创作者仪表盘", href: "/dashboard" }, { label: "项目" }]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <ProjectsPageClient
                    projects={sortedSchematics}
                    currentUserId={user?.user_id ?? ""}
                    isLoading={isLoading}
                    onRefetch={refetchSchematics}
                />
            </div>
        </>
    );
}
