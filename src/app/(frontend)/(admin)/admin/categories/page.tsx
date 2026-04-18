import { supabaseServerAdmin } from "@/lib/database";
import { Prime } from "@/components";
import { CategoriesPageClient } from "@/components/@prime-light/dashboard/categories-page-client";
import { Schematic } from "@/schema";

export default async function CategoriesPage() {
    const { data: categories, error } = await supabaseServerAdmin
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch categories:", error);
    }

    const categoryList: Schematic.Category.Category[] = categories?.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon_url: c.icon_url,
        created_at: c.created_at,
        updated_at: c.updated_at,
    })) ?? [];

    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[
                    { label: "管理后台", href: "/admin" },
                    { label: "分类管理" },
                ]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <CategoriesPageClient initialCategories={categoryList} />
            </div>
        </>
    );
}
