import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TypewriterTitle } from "@/components/typewriter-title";
import { Upload, Download, Eye, Code2, Heart, Box, ArrowRight } from "lucide-react";
import Link from "next/link";

const TITLES = [
    { text: "SyncmaticaLand", lang: "en" },
    { text: "投影共和国", lang: "zh" },
];

const features = [
    {
        icon: Upload,
        title: "上传原理图",
        description: "轻松上传您的 Minecraft 投影原理图，与社区分享您的建筑作品。",
    },
    {
        icon: Download,
        title: "免费下载",
        description: "浏览海量社区共享的原理图，一键下载到您的游戏中使用。",
    },
    {
        icon: Eye,
        title: "在线预览",
        description: "无需下载即可在线预览原理图内容，快速找到您需要的建筑。",
    },
    {
        icon: Code2,
        title: "API 支持",
        description: "提供完整的 RESTful API，方便开发者集成和自动化下载。",
    },
];

const recentSchematics = [
    { id: 1, name: "中世纪城堡", author: "BuilderPro", downloads: 1280, category: "建筑" },
    { id: 2, name: "自动化农场", author: "RedstoneMaster", downloads: 856, category: "红石" },
    { id: 3, name: "现代别墅", author: "ArchitectOne", downloads: 2341, category: "建筑" },
    { id: 4, name: "刷怪塔", author: "SurvivalExpert", downloads: 3422, category: "生存" },
];

export default function Home() {
    return (
        <div className="w-full flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 lg:py-32 overflow-hidden">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
                        <div className="space-y-3 sm:space-y-4">
                            <TypewriterTitle contents={TITLES} />
                            <p className="text-lg sm:text-xl text-muted-foreground md:text-2xl">Minecraft 原理图共享平台</p>
                        </div>
                        <p className="mx-auto max-w-175 text-sm sm:text-base text-muted-foreground md:text-xl px-2 sm:px-0">
                            在这里，分享和发现精彩的 Minecraft 建筑投影。无论是宏伟的城堡还是精巧的红石机械，这里都有你需要的灵感。
                        </p>
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                            <Button size="lg" asChild className="w-full sm:w-auto">
                                <Link href="/schematics">
                                    <Box className="mr-2 h-5 w-5" />
                                    浏览原理图
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                                <Link href="/api-docs">
                                    <Code2 className="mr-2 h-5 w-5" />
                                    API 文档
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Features Section */}
            <section className="py-12 sm:py-16 lg:py-24">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">平台特色</h2>
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">为 Minecraft 玩家打造的专业原理图共享平台</p>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="relative overflow-hidden">
                                    <CardHeader className="p-4 sm:p-6">
                                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 mb-3 sm:mb-4">
                                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                        <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <Separator />

            {/* Recent Schematics Section */}
            <section className="py-12 sm:py-16 lg:py-24">
                <div className="container px-4 md:px-6">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">最新原理图</h2>
                            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">社区最新分享的优秀作品</p>
                        </div>
                        <Button variant="ghost" asChild size="sm" className="hidden sm:flex items-center">
                            <Link href="/schematics">
                                查看全部
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {recentSchematics.map((schematic) => (
                            <Card key={schematic.id} className="cursor-pointer transition-shadow hover:shadow-lg">
                                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                                        <Box className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-sm sm:text-base truncate">{schematic.name}</h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground">by {schematic.author}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs shrink-0">
                                            {schematic.category}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <Download className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        {schematic.downloads.toLocaleString()} 次下载
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-4 sm:mt-6 text-center sm:hidden">
                        <Button variant="ghost" asChild size="sm">
                            <Link href="/schematics" className="flex items-center justify-center">
                                查看全部
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 lg:py-24 bg-muted/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center">
                        <h2 className="text-xl lg:text-3xl font-bold tracking-tight sm:text-4xl">探索更多精彩的建筑作品</h2>
                        <p className="mx-auto max-w-150 text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
                            加入 SyncmaticaLand 社区，发现全球 Minecraft 玩家的创意建筑。
                        </p>
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                            <Button size="lg" asChild className="w-full sm:w-auto">
                                <Link href="/schematics">
                                    <Box className="mr-2 h-5 w-5" />
                                    浏览原理图
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                                <Link href="/sponsor">
                                    <Heart className="mr-2 h-5 w-5" />
                                    支持我们
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-6 sm:py-8">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
                        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">© 2025 SyncmaticaLand 投影共和国</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Made by Prime-Light Team</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
