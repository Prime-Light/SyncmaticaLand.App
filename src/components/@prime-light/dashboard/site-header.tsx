import Link from "next/link";
import { PrimeLight, Radix } from "@/components";

export function SiteHeader() {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex h-full w-full items-center justify-between gap-4 px-4 lg:px-6">
                <Radix.Breadcrumb>
                    <Radix.BreadcrumbList>
                        <Radix.BreadcrumbItem>
                            <Radix.BreadcrumbLink asChild>
                                <Link href="/">投影共和国 | 创作者面板</Link>
                            </Radix.BreadcrumbLink>
                        </Radix.BreadcrumbItem>
                        <Radix.BreadcrumbSeparator>-</Radix.BreadcrumbSeparator>
                        <Radix.BreadcrumbItem>
                            <Radix.BreadcrumbPage>仪表盘</Radix.BreadcrumbPage>
                        </Radix.BreadcrumbItem>
                    </Radix.BreadcrumbList>
                </Radix.Breadcrumb>
                <div className="flex h-full shrink-0 items-center">
                    <PrimeLight.ThemeToggle />
                </div>
            </div>
        </header>
    );
}
