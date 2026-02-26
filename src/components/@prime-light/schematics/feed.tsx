"use client";

import { Button, Card, RadioGroup, RadioGroupItem } from "@/components";
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
            <Card size="sm">
                <section className="w-ful flex h-full">
                    <div className="flex h-full items-center px-4">
                        <span className="text-foreground translate-y-px text-sm font-medium">视图</span>
                        <RadioGroup className="ml-4 flex w-32" value={view}>
                            <RadioGroupItem variant="button" value="list" onClick={() => setView("list")}>
                                <List className="h-4 w-4" />
                            </RadioGroupItem>
                            <RadioGroupItem variant="button" value="grid" onClick={() => setView("grid")}>
                                <LayoutGrid className="h-4 w-4" />
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <div className="mr-4 ml-auto">
                        <RadioGroup className="flex w-full" value={sort}>
                            <RadioGroupItem variant="buttonPrimary" value="all" onClick={() => setSort("all")}>
                                全部内容
                            </RadioGroupItem>
                            <RadioGroupItem variant="buttonPrimary" value="event" onClick={() => setSort("event")}>
                                限时热推
                            </RadioGroupItem>
                            <RadioGroupItem variant="buttonPrimary" value="new" onClick={() => setSort("new")}>
                                新品与热门
                            </RadioGroupItem>
                            <RadioGroupItem variant="buttonPrimary" value="popular" onClick={() => setSort("popular")}>
                                最受欢迎
                            </RadioGroupItem>
                            <RadioGroupItem variant="buttonPrimary" value="prerelease" onClick={() => setSort("prerelease")}>
                                即将推出
                            </RadioGroupItem>
                            <RadioGroupItem variant="buttonPrimary" value="stared" onClick={() => setSort("stared")}>
                                心愿单
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                </section>
            </Card>
        </div>
    );
}
