import { Prime } from "@/components";

export default async function PrimaryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar initialUser={null} />

            {/* 主内容  */}
            {children}

            {/* 脚部 */}
            <Prime.Footer />
        </>
    );
}
