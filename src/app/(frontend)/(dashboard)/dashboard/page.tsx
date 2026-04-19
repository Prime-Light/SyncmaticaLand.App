import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/database";
import { Prime } from "@/components";
import { DashboardStats } from "@/components/@prime-light/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/@prime-light/dashboard/recent-projects";
import { Schematic, WrapSchema } from "@/schema";

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL || `${protocol}://${host}`;
    const cookie = headersList.get("cookie") || "";

    let schematics: Schematic.Schematic.Schematic[] = [];

    try {
        const res = await fetch(
            `${baseUrl}/api/v1/schematics?author_id=${user.id}&limit=100&offset=0`,
            {
                headers: { cookie },
                cache: "no-store",
            }
        );

        if (res.ok) {
            const result = (await res.json()) as WrapSchema<Schematic.Schematic.SchematicListRes>;
            schematics = result.data.schematics ?? [];
        } else {
            console.error("Failed to fetch schematics via API:", res.status);
        }
    } catch (err) {
        console.error("Failed to fetch schematics via API:", err);
    }

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
