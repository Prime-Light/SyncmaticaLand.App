import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/database";
import { Prime } from "@/components";
import { ProjectsPageClient } from "@/components/@prime-light/dashboard/projects-page-client";
import { Schematic, WrapSchema } from "@/schema";

export default async function ProjectsPage() {
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

    const sortedSchematics = [...schematics].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[{ label: "创作者仪表盘", href: "/dashboard" }, { label: "项目" }]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <ProjectsPageClient projects={sortedSchematics} currentUserId={user.id} />
            </div>
        </>
    );
}
