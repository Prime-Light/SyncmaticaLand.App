import { supabaseServerAdmin } from "@/lib/database";
import { Prime } from "@/components";
import { AuditPageClient } from "@/components/@prime-light/dashboard/audit-page-client";
import { Schematic } from "@/schema";

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const params = await searchParams;
    const statusParam = params.status;

    const validStatuses: (Schematic.Schematic.ProjectStatus | "all")[] = [
        "draft",
        "published",
        "under_review",
        "rejected",
        "all",
    ];
    const filterStatus: Schematic.Schematic.ProjectStatus | "all" = validStatuses.includes(
        statusParam as Schematic.Schematic.ProjectStatus | "all"
    )
        ? (statusParam as Schematic.Schematic.ProjectStatus | "all")
        : "under_review";

    let query = supabaseServerAdmin
        .from("schematics")
        .select(
            `
            id,
            author_id,
            name,
            description,
            status,
            format,
            mc_version,
            tags,
            file_url,
            images,
            upvotes,
            starred,
            viewed,
            created_at,
            updated_at,
            author:profiles!schematics_author_id_fkey (
                display_name
            )
        `
        )
        .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
    }

    const { data: schematics, error } = await query;

    if (error) {
        console.error("Failed to fetch schematics:", error);
    }

    const projects: (Schematic.Schematic.Schematic & { author_name: string })[] =
        schematics?.map((s) => {
            const author = s.author as Array<{ display_name: string | null }> | null;
            return {
                id: s.id,
                author_id: s.author_id,
                name: s.name,
                description: s.description,
                status: s.status,
                format: s.format,
                mc_version: s.mc_version,
                tags: s.tags ?? [],
                file_url: s.file_url,
                images: s.images ?? [],
                upvotes: s.upvotes ?? 0,
                starred: s.starred ?? 0,
                viewed: s.viewed ?? 0,
                created_at: s.created_at,
                updated_at: s.updated_at,
                author_name: author?.[0]?.display_name ?? "未知用户",
            };
        }) ?? [];

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[
                    { label: "管理后台", href: "/admin" },
                    { label: "项目审核" },
                ]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <AuditPageClient
                    initialProjects={projects}
                    initialStatusFilter={filterStatus}
                />
            </div>
        </>
    );
}
