import { redirect } from "next/navigation";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { Prime } from "@/components";
import { DashboardStats } from "@/components/@prime-light/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/@prime-light/dashboard/recent-projects";
import { Schematic } from "@/schema";

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data, error } = await supabaseServerAdmin.rpc("rpc__schematics_with_categories", {
        p_status: null,
        p_category_id: null,
        p_author_id: user.id,
        p_limit: 100,
        p_offset: 0,
    });

    if (error) {
        console.error("Failed to fetch schematics:", error);
    }

    interface SchematicResult {
        schematics: Schematic.Schematic.Schematic[];
        total: number;
    }

    const result = data as SchematicResult | null;
    const schematics = result?.schematics ?? [];

    const totalProjects = schematics.length;
    const totalViews = schematics.reduce((sum, s) => sum + (s.viewed ?? 0), 0);
    const totalUpvotes = schematics.reduce((sum, s) => sum + (s.upvotes ?? 0), 0);
    const totalStars = schematics.reduce((sum, s) => sum + (s.starred ?? 0), 0);

    const recentProjects = [...schematics]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
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
                />
                <RecentProjects projects={recentProjects} />
            </div>
        </>
    );
}
