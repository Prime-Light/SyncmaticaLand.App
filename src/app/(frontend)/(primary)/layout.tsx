import { Footer } from "@/components/@prime-light/layout/footer";
import { Navbar } from "@/components/@prime-light/layout/navbar";

export default async function PrimaryLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar initialUser={null} />
            {children}
            <Footer />
        </>
    );
}
