"use client";

import { Prime, Shadcn } from "@/components";
import { useSchematics, useCategories } from "@/hooks";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";

const PAGE_SIZE = 12;

export default function SchematicsIndex() {
    const [selectedTag, setSelectedTag] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    const { categories, isLoading: categoriesLoading } = useCategories();
    const {
        schematics,
        isLoading: schematicsLoading,
        error,
        refetch,
    } = useSchematics({
        status: "published",
        category_id: selectedTag !== "all" ? selectedTag : undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    });

    const accumulatedSchematics = useMemo(() => {
        if (!schematics?.schematics) return [];
        return schematics.schematics;
    }, [schematics]);

    const filteredSchematics = useMemo(() => {
        if (!accumulatedSchematics) return [];
        if (!searchQuery.trim()) return accumulatedSchematics;

        const query = searchQuery.toLowerCase();
        return accumulatedSchematics.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.description?.toLowerCase().includes(query) ||
                s.tags.some((t) => t.toLowerCase().includes(query))
        );
    }, [accumulatedSchematics, searchQuery]);

    const handleLoadMore = useCallback(() => {
        setPage((p) => p + 1);
    }, []);

    const handleTagChange = useCallback((tagId: string) => {
        setSelectedTag(tagId);
        setPage(1);
    }, []);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const hasMore = schematics ? page < schematics.total_pages : false;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="relative">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
                    <div className="text-center">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            原理图市场
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            发现、分享和下载 Minecraft 原理图，探索无限创意的世界。
                            在这里，建筑师们展示他们的杰作，玩家找到下一个伟大项目的灵感。
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                    <div className="relative mb-6">
                        <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Shadcn.Input
                            type="text"
                            placeholder="搜索原理图..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Shadcn.Button
                            variant={selectedTag === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTagChange("all")}>
                            全部
                        </Shadcn.Button>
                        {categories?.categories.map((category) => (
                            <Shadcn.Button
                                key={category.id}
                                variant={selectedTag === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTagChange(category.id)}>
                                {category.name}
                            </Shadcn.Button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pt-0 pb-6 sm:px-6 sm:pb-7 lg:px-8 lg:pb-8">
                {error && (
                    <div className="mb-6 flex flex-col items-center justify-center gap-4 py-12">
                        <AlertCircle className="size-12 text-destructive" />
                        <p className="text-lg text-muted-foreground">加载失败，请重试</p>
                        <Shadcn.Button variant="outline" onClick={() => refetch()}>
                            重试
                        </Shadcn.Button>
                    </div>
                )}

                {!error && schematicsLoading && page === 1 && accumulatedSchematics.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!error && !schematicsLoading && filteredSchematics.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg text-muted-foreground">暂无原理图</p>
                    </div>
                )}

                {!error && filteredSchematics.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredSchematics.map((schematic) => (
                                <Prime.SchematicCard key={schematic.id} {...schematic} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <Shadcn.Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8"
                                    onClick={handleLoadMore}
                                    disabled={schematicsLoading}>
                                    {schematicsLoading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            加载中...
                                        </>
                                    ) : (
                                        "加载更多"
                                    )}
                                </Shadcn.Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
