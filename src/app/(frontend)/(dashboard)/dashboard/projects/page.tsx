import { redirect } from "next/navigation";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { Prime } from "@/components";
import { ProjectsPageClient } from "@/components/@prime-light/dashboard/projects-page-client";
import { Schematic } from "@/schema";

export default async function ProjectsPage() {
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

    const sortedSchematics = [...schematics].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[
                    { label: "创作者仪表盘", href: "/dashboard" },
                    { label: "项目" },
                ]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <ProjectsPageClient projects={sortedSchematics} currentUserId={user.id} />
            </div>
        </>
    );
}
