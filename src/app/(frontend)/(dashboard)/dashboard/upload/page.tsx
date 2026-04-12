import { Prime } from "@/components";

export default function UploadPage() {
    return (
        <>
            <Prime.SiteHeader
                breadcrumbs={[
                    { label: "创作者仪表盘", href: "/dashboard" },
                    { label: "上传原理图" },
                ]}
            />
            <div className="flex flex-1 flex-col overflow-y-auto">
                <Prime.UploadSchematicForm />
            </div>
        </>
    );
}
