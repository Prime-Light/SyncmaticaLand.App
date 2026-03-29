import { Prime } from "@/components";

export default function DocsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar />

            {/* 主内容 */}
            <div className="mt-8 text-foreground!">{children}</div>
        </>
    );
}
