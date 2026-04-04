import { Prime } from "@/components";
import "./ui.css";

export default async function DocsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar initialUser={null} />

            {/* 主内容 */}
            <div className="mt-8">{children}</div>
        </>
    );
}
