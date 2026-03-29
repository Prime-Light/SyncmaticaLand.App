import { Prime } from "@/components";
import { getUser } from "@/lib/auth/me";
import "./ui.css";

export default async function DocsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getUser();

    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar initialUser={user} />

            {/* 主内容 */}
            <div className="mt-8">{children}</div>
        </>
    );
}
