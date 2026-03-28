import { Geist_Mono, Inter, Noto_Sans } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Prime } from "@/components";

const notoSansHeading = Noto_Sans({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="zh-CN"
            suppressHydrationWarning
            className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, notoSansHeading.variable)}>
            <body>
                <Prime.ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {/* 导航栏 */}
                    <Prime.Navbar />

                    {/* 主内容 */}
                    <div className="mt-8 text-foreground!">{children}</div>
                </Prime.ThemeProvider>
            </body>
        </html>
    );
}
