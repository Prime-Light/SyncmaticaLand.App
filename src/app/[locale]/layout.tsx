import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { ThemeProvider, PrimeLight, Radix } from "@/components";
import { routing } from "@/i18n/routing";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Syncmaticaland · 投影共和国",
};

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Readonly<Props>) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        // 如果 locale 不存在，返回 404 错误
        notFound();
    }

    return (
        <html lang={locale} className={figtree.variable} suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NextIntlClientProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <Radix.TooltipProvider>
                            <PrimeLight.Navbar />
                            {children}
                        </Radix.TooltipProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
