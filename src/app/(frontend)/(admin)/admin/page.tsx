import { supabaseServerAdmin } from "@/lib/database";
import { Prime } from "@/components";
import { AdminStats } from "@/components/@prime-light/dashboard/admin-stats";
import { RecentActivity } from "@/components/@prime-light/dashboard/recent-activity";

function resolveAuthorName(author: unknown): string {
    const getName = (v: unknown) => {
        if (!v || typeof v !== "object") return null;
        const raw = (v as { display_name?: unknown }).display_name;
        if (typeof raw !== "string") return null;
        const name = raw.trim();
        return name.length > 0 ? name : null;
    };

    if (Array.isArray(author)) {
        for (const item of author) {
            const name = getName(item);
            if (name) return name;
        }
        return "未知用户";
    }

    return getName(author) ?? "未知用户";
}

export default async function AdminPage() {
    const { count: totalUsers, error: usersError } = await supabaseServerAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });

    if (usersError) {
        console.error("Failed to fetch total users:", usersError);
    }

    const { count: totalSchematics, error: schematicsError } = await supabaseServerAdmin
        .from("schematics")
        .select("*", { count: "exact", head: true });

    if (schematicsError) {
        console.error("Failed to fetch total schematics:", schematicsError);
    }

    const { count: pendingReviews, error: pendingError } = await supabaseServerAdmin
        .from("schematics")
        .select("*", { count: "exact", head: true })
        .eq("status", "under_review");

    if (pendingError) {
        console.error("Failed to fetch pending reviews:", pendingError);
    }

    const { data: viewsData, error: viewsError } = await supabaseServerAdmin
        .from("schematics")
        .select("viewed");

    if (viewsError) {
        console.error("Failed to fetch views:", viewsError);
    }

    const totalViews = viewsData?.reduce((sum, s) => sum + (s.viewed ?? 0), 0) ?? 0;

    const { data: recentSchematics, error: recentError } = await supabaseServerAdmin
        .from("schematics")
        .select(
            `
            id,
            name,
            status,
            created_at,
            author:profiles!schematics_author_id_fkey (
                display_name
            )
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

    if (recentError) {
        console.error("Failed to fetch recent schematics:", recentError);
    }

    const recentActivities =
        recentSchematics?.map((s) => {
            return {
                id: s.id,
                name: s.name,
                author_name: resolveAuthorName(s.author),
                status: s.status,
                created_at: s.created_at,
            };
        }) ?? [];

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[
                    { label: "管理后台", href: "/admin" },
                    { label: "概览" },
                ]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <AdminStats
                    totalUsers={totalUsers ?? 0}
                    totalSchematics={totalSchematics ?? 0}
                    pendingReviews={pendingReviews ?? 0}
                    totalViews={totalViews}
                />
                <RecentActivity activities={recentActivities} />
            </div>
        </>
    );
}
