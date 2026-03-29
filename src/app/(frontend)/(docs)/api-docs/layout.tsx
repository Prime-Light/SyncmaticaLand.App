import { Prime } from "@/components";
import "./ui.css";

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
            <div className="mt-8">{children}</div>
        </>
    );
}
