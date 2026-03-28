"use client";

import { Shadcn } from "@/components";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";

type SchematicFeedProps = {
    className?: string;
};

export function SchematicFeed({ className, ...props }: SchematicFeedProps) {
    const [view, setView] = useState("list");
    const [sort, setSort] = useState("event");

    return (
        <div className={cn("h-full w-full", className)} {...props}>
            <Shadcn.Card size="sm">
                <section className="w-ful flex h-full">
                    <div className="flex h-full items-center px-4">
                        <span className="translate-y-px text-sm font-medium text-foreground">视图</span>
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
                            <Shadcn.RadioGroupItem value="event" onClick={() => setSort("event")}>
                                限时热推
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="new" onClick={() => setSort("new")}>
                                新品与热门
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="popular" onClick={() => setSort("popular")}>
                                最受欢迎
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="prerelease" onClick={() => setSort("prerelease")}>
                                即将推出
                            </Shadcn.RadioGroupItem>
                            <Shadcn.RadioGroupItem value="stared" onClick={() => setSort("stared")}>
                                心愿单
                            </Shadcn.RadioGroupItem>
                        </Shadcn.RadioGroup>
                    </div>
                </section>
            </Shadcn.Card>
        </div>
    );
}
