"use client";

import { Prime, Shadcn } from "@/components";
import { Search } from "lucide-react";
import { useState } from "react";

const TAGS = [
    { id: "all", label: "全部" },
    { id: "building", label: "建筑" },
    { id: "redstone", label: "红石" },
    { id: "decoration", label: "装饰" },
    { id: "farm", label: "农场" },
    { id: "modern", label: "现代" },
    { id: "medieval", label: "中世纪" },
    { id: "fantasy", label: "幻想" },
];

export default function SchematicsIndex() {
    const [selectedTag, setSelectedTag] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
                    <div className="text-center">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">原理图市场</h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            发现、分享和下载 Minecraft 原理图，探索无限创意的世界。
                            在这里，建筑师们展示他们的杰作，玩家找到下一个伟大项目的灵感。
                        </p>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Shadcn.Input
                            type="text"
                            placeholder="搜索原理图..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map((tag) => (
                            <Shadcn.Button
                                key={tag.id}
                                variant={selectedTag === tag.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTag(tag.id)}>
                                {tag.label}
                            </Shadcn.Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cards Grid */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Placeholder Cards - to be replaced with actual data */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Prime.SchematicCard
                            key={i}
                            id={`schematic-${i + 1}`}
                            title={`原理图标题 ${i + 1}`}
                            description="这是一个示例原理图描述，展示了这个建筑的详细信息。"
                            author="作者名称"
                            likes={234 + i * 10}
                            downloads={1200 + i * 50}
                            views={5678 + i * 100}
                        />
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-12 flex justify-center">
                    <Shadcn.Button variant="outline" size="lg" className="px-8">
                        加载更多
                    </Shadcn.Button>
                </div>
            </section>
        </main>
    );
}
