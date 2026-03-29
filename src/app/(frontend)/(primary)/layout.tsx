import { Prime } from "@/components";

export default function PrimaryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar />

            {/* 主内容  */}
            {children}

            {/* 脚部 */}
            <Prime.Footer />
        </>
    );
}
