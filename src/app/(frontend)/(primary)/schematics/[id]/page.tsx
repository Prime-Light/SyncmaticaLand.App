import { Prime } from "@/components";

interface SchematicDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function SchematicDetailPage({ params }: SchematicDetailPageProps) {
    const { id } = await params;
    return <Prime.SchematicDetailClient id={id} />;
}
