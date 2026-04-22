import * as React from "react";
import Link from "next/link";
import * as Shadcn from "@/components/@shadcn-ui";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface SiteHeaderProps {
    children?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export function SiteHeader({ children, breadcrumbs, title }: SiteHeaderProps) {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-2 px-4 lg:px-6">
                <Shadcn.SidebarTrigger className="shrink-0" />
                <div className="h-4 w-px shrink-0 bg-border" />
                {children ??
                    (breadcrumbs && breadcrumbs.length > 0 ? (
                        <Shadcn.Breadcrumb>
                            <Shadcn.BreadcrumbList className="text-sm sm:gap-2.5">
                                {breadcrumbs.map((item, index) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && <Shadcn.BreadcrumbSeparator />}
                                        <Shadcn.BreadcrumbItem>
                                            {item.href ? (
                                                <Shadcn.BreadcrumbLink
                                                    asChild
                                                    className="text-muted-foreground">
                                                    <Link href={item.href}>{item.label}</Link>
                                                </Shadcn.BreadcrumbLink>
                                            ) : (
                                                <Shadcn.BreadcrumbPage>
                                                    {item.label}
                                                </Shadcn.BreadcrumbPage>
                                            )}
                                        </Shadcn.BreadcrumbItem>
                                    </React.Fragment>
                                ))}
                            </Shadcn.BreadcrumbList>
                        </Shadcn.Breadcrumb>
                    ) : (
                        <h1 className="text-base font-medium">{title ?? "创作者仪表盘"}</h1>
                    ))}
            </div>
        </header>
    );
}
