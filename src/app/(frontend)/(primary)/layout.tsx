import { Prime } from "@/components";
import { getUser } from "@/lib/auth/me";

export default async function PrimaryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getUser();

    return (
        <>
            {/* 导航栏 */}
            <Prime.Navbar initialUser={user} />

            {/* 主内容  */}
            {children}

            {/* 脚部 */}
            <Prime.Footer />
        </>
    );
}
