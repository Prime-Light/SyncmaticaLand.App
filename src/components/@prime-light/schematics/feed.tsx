"use client";

import { Prime, Shadcn } from "@/components";
import { useSchematics } from "@/hooks";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

type SortOption = "all" | "event" | "new" | "popular" | "prerelease" | "stared";

type SchematicFeedProps = {
    className?: string;
};

export function SchematicFeed({ className, ...props }: SchematicFeedProps) {
    const [view, setView] = useState<"list" | "grid">("list");
    const [sort, setSort] = useState<SortOption>("all");

    const { schematics, isLoading, error } = useSchematics({
        status: sort === "prerelease" ? "under_review" : "published",
        limit: 20,
    });

    const sortedSchematics = useMemo(() => {
        if (!schematics?.schematics) return [];

        const items = [...schematics.schematics];

        switch (sort) {
            case "new":
                return items.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
            case "popular":
                return items.sort((a, b) => b.viewed - a.viewed);
            case "event":
                return items.sort((a, b) => b.upvotes - a.upvotes);
            case "stared":
                return items.sort((a, b) => b.starred - a.starred);
            default:
                return items;
        }
    }, [schematics?.schematics, sort]);

    return (
        <div className={cn("h-full w-full", className)} {...props}>
            <Shadcn.Card size="sm">
                <section className="w-full flex h-full">
                    <div className="flex h-full items-center px-4">
                        <span className="translate-y-px text-sm font-medium text-foreground">
                            视图
                        </span>
                        <Shadcn.RadioGroup className="ml-4 flex w-32" value={view}>
                            <Shadcn.RadioGroupItem value="list" onClick={() => setView("list")}>
                                <List className="h-4 w-4" />
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="grid" onClick={() => setView("grid")}>
                                <LayoutGrid className="h-4 w-4" />
                            </Shadcn.RadioGroupItem>
                        </Shadcn.RadioGroup>
                    </div>
                    <div className="mr-4 ml-auto">
                        <Shadcn.RadioGroup className="flex w-full" value={sort}>
                            <Shadcn.RadioGroupItem value="all" onClick={() => setSort("all")}>
                                全部内容
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem
                                value="event"
                                onClick={() => setSort("event")}>
                                限时热推
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="new" onClick={() => setSort("new")}>
                                新品与热门
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem
                                value="popular"
                                onClick={() => setSort("popular")}>
                                最受欢迎
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem
                                value="prerelease"
                                onClick={() => setSort("prerelease")}>
                                即将推出
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem
                                value="stared"
                                onClick={() => setSort("stared")}>
                                心愿单
                            </Shadcn.RadioGroupItem>
                        </Shadcn.RadioGroup>
                    </div>
                </section>
            </Shadcn.Card>

            <div className="mt-4">
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg text-muted-foreground">加载失败</p>
                    </div>
                )}

                {!isLoading && !error && sortedSchematics.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg text-muted-foreground">暂无原理图</p>
                    </div>
                )}

                {!isLoading && !error && sortedSchematics.length > 0 && (
                    <div
                        className={cn(
                            view === "grid"
                                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                : "flex flex-col gap-4"
                        )}>
                        {sortedSchematics.map((schematic) => (
                            <Prime.SchematicCard key={schematic.id} {...schematic} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
