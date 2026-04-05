import { Geist_Mono, Inter, Noto_Sans } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Prime, Shadcn } from "@/components";
import { TooltipProvider } from "@/components/@shadcn-ui";

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
            className={cn(
                "antialiased",
                fontMono.variable,
                "font-sans",
                inter.variable,
                notoSansHeading.variable
            )}>
            <body className="min-h-svh">
                <Prime.ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange>
                    <div className="flex min-h-svh flex-col">
                        <TooltipProvider>{children}</TooltipProvider>
                        <Shadcn.Toaster position="bottom-right" duration={3000} />
                    </div>
                </Prime.ThemeProvider>
            </body>
        </html>
    );
}
