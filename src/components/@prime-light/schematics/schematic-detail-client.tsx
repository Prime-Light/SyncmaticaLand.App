"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
    Heart,
    Star,
    Download,
    Calendar,
    Tag,
    Cpu,
    FileType,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Share2,
    Check,
} from "lucide-react";
import { Shadcn, Prime } from "@/components";
import { useSchematic, useEngagement } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SchematicDetailClientProps = {
    id: string;
};

const FORMAT_LABEL: Record<string, string> = {
    litematic: "Litematic",
    schem: "Schematic",
    nbt: "NBT",
    bp: "Blueprint",
};

function formatCount(n: number): string {
    if (n > 999999) return `${(n / 1000000).toFixed(1)}m`;
    if (n > 999) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

type DescriptionCardProps =
    | { skeleton: true }
    | { skeleton?: false; description: string | null };

function DescriptionCard(props: DescriptionCardProps) {
    return (
        <Shadcn.Card className="mt-6">
            <Shadcn.CardHeader>
                <Shadcn.CardTitle className="text-base">
                    {props.skeleton ? <Shadcn.Skeleton className="h-5 w-32" /> : "关于此原理图"}
                </Shadcn.CardTitle>
            </Shadcn.CardHeader>
            <Shadcn.CardContent>
                {props.skeleton ? (
                    <div className="flex flex-col gap-2">
                        <Shadcn.Skeleton className="h-4 w-full" />
                        <Shadcn.Skeleton className="h-4 w-full" />
                        <Shadcn.Skeleton className="h-4 w-3/4" />
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                        {props.description}
                    </p>
                )}
            </Shadcn.CardContent>
        </Shadcn.Card>
    );
}

type TitleAuthorProps =
    | { skeleton: true }
    | { skeleton?: false; name: string; authorName: string; authorInitial: string };

function TitleAuthor(props: TitleAuthorProps) {
    return (
        <div>
            {props.skeleton ? (
                <>
                    <Shadcn.Skeleton className="h-9 w-3/4 rounded" />
                    <div className="mt-3 flex items-center gap-2">
                        <Shadcn.Skeleton className="size-8 rounded-full" />
                        <Shadcn.Skeleton className="h-4 w-24 rounded" />
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {props.name}
                    </h1>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                                {props.authorInitial}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {props.authorName}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

type StatsRowProps =
    | { skeleton: true }
    | { skeleton?: false; upvoteCount: number; starCount: number; viewed: number };

function StatsRow(props: StatsRowProps) {
    return (
        <div className="flex gap-4">
            {props.skeleton ? (
                <>
                    <Shadcn.Skeleton className="h-10 w-10 rounded" />
                    <Shadcn.Skeleton className="w-px self-stretch bg-border" />
                    <Shadcn.Skeleton className="h-10 w-10 rounded" />
                    <Shadcn.Skeleton className="w-px self-stretch bg-border" />
                    <Shadcn.Skeleton className="h-10 w-10 rounded" />
                </>
            ) : (
                <>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">
                            {formatCount(props.upvoteCount)}
                        </span>
                        <span className="text-xs text-muted-foreground">点赞</span>
                    </div>
                    <Shadcn.Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">
                            {formatCount(props.starCount)}
                        </span>
                        <span className="text-xs text-muted-foreground">收藏</span>
                    </div>
                    <Shadcn.Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">{formatCount(props.viewed)}</span>
                        <span className="text-xs text-muted-foreground">浏览</span>
                    </div>
                </>
            )}
        </div>
    );
}

type ActionButtonsProps =
    | { skeleton: true }
    | {
          skeleton?: false;
          fileUrl: string;
          upvoted: boolean;
          upvoteLoading: boolean;
          starred: boolean;
          starLoading: boolean;
          copied: boolean;
          onDownload: () => void;
          onUpvote: () => void;
          onStar: () => void;
          onShare: () => void;
      };

function ActionButtons(props: ActionButtonsProps) {
    return (
        <div className="flex flex-col gap-3">
            {props.skeleton ? (
                <>
                    <Shadcn.Skeleton className="h-9 w-full rounded" />
                    <div className="flex gap-2">
                        <Shadcn.Skeleton className="h-8 flex-1 rounded" />
                        <Shadcn.Skeleton className="h-8 flex-1 rounded" />
                        <Shadcn.Skeleton className="size-8 rounded" />
                    </div>
                </>
            ) : (
                <>
                    <Shadcn.Button
                        size="lg"
                        className="w-full"
                        onClick={props.onDownload}
                        disabled={!props.fileUrl}>
                        <Download data-icon="inline-start" />
                        下载原理图
                    </Shadcn.Button>

                    <div className="flex gap-2">
                        <Shadcn.Button
                            variant={props.upvoted ? "secondary" : "outline"}
                            className="flex-1"
                            onClick={props.onUpvote}
                            disabled={props.upvoteLoading}>
                            {props.upvoteLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Heart
                                    data-icon="inline-start"
                                    className={cn(props.upvoted && "fill-red-500 text-red-500")}
                                />
                            )}
                            {props.upvoted ? "已点赞" : "点赞"}
                        </Shadcn.Button>

                        <Shadcn.Button
                            variant={props.starred ? "secondary" : "outline"}
                            className="flex-1"
                            onClick={props.onStar}
                            disabled={props.starLoading}>
                            {props.starLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Star
                                    data-icon="inline-start"
                                    className={cn(
                                        props.starred && "fill-yellow-500 text-yellow-500"
                                    )}
                                />
                            )}
                            {props.starred ? "已收藏" : "收藏"}
                        </Shadcn.Button>

                        <Shadcn.Button
                            variant="outline"
                            size="icon"
                            onClick={props.onShare}
                            aria-label="分享">
                            {props.copied ? (
                                <Check className="size-4 text-green-500" />
                            ) : (
                                <Share2 className="size-4" />
                            )}
                        </Shadcn.Button>
                    </div>
                </>
            )}
        </div>
    );
}

type MetaRowProps =
    | { skeleton: true }
    | {
          skeleton?: false;
          format: string;
          mcVersion: string;
          createdAt: string;
      };

function MetaRows(props: MetaRowProps) {
    return (
        <div className="flex flex-col gap-3 text-sm">
            {props.skeleton ? (
                <>
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Shadcn.Skeleton className="size-4 rounded" />
                            <Shadcn.Skeleton className="h-4 w-16 rounded" />
                            <Shadcn.Skeleton className="ml-auto h-5 w-20 rounded-full" />
                        </div>
                    ))}
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileType className="size-4 shrink-0" />
                        <span className="font-medium text-foreground">格式</span>
                        <Shadcn.Badge variant="secondary" className="ml-auto">
                            {FORMAT_LABEL[props.format] ?? props.format}
                        </Shadcn.Badge>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="size-4 shrink-0" />
                        <span className="font-medium text-foreground">Minecraft 版本</span>
                        <Shadcn.Badge variant="secondary" className="ml-auto">
                            {props.mcVersion}
                        </Shadcn.Badge>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 shrink-0" />
                        <span className="font-medium text-foreground">发布时间</span>
                        <Shadcn.Badge variant="secondary" className="ml-auto">
                            {formatDate(props.createdAt)}
                        </Shadcn.Badge>
                    </div>
                </>
            )}
        </div>
    );
}

function PageShell({
    leftCol,
    rightCol,
}: {
    leftCol: React.ReactNode;
    rightCol: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/schematics"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ArrowLeft className="size-4" />
                    返回市场
                </Link>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    <div className="lg:col-span-2">{leftCol}</div>
                    <div className="flex flex-col gap-5">{rightCol}</div>
                </div>
            </div>
        </main>
    );
}

export function SchematicDetailClient({ id }: SchematicDetailClientProps) {
    const { schematic: res, isLoading, error, refetch } = useSchematic(id);
    const { upvote, unupvote, star, unstar } = useEngagement();

    const [upvoted, setUpvoted] = useState(false);
    const [starred, setStarred] = useState(false);
    const [upvoteDelta, setUpvoteDelta] = useState(0);
    const [starDelta, setStarDelta] = useState(0);
    const [upvoteLoading, setUpvoteLoading] = useState(false);
    const [starLoading, setStarLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchUserActions = async () => {
            try {
                const response = await fetch(`/api/v1/schematics/${id}/status`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data) {
                        setUpvoted(result.data.has_upvoted);
                        setStarred(result.data.has_starred);
                    }
                }
            } catch {
                // Silently fail - states remain false
            }
        };
        fetchUserActions();
    }, [id]);

    const { upvoteCount, starCount } = useMemo(() => {
        const schematic = res?.schematic;
        return {
            upvoteCount: (schematic?.upvotes ?? 0) + upvoteDelta,
            starCount: (schematic?.starred ?? 0) + starDelta,
        };
    }, [res?.schematic, upvoteDelta, starDelta]);

    const handleUpvote = useCallback(async () => {
        if (upvoteLoading) return;
        setUpvoteLoading(true);
        const result = upvoted ? await unupvote(id) : await upvote(id);
        if (result) {
            const newState = !upvoted;
            setUpvoted(newState);
            setUpvoteDelta((prev) => prev + (newState ? 1 : -1));
            try {
                const localUpvotes = JSON.parse(
                    localStorage.getItem("syncmaticaland_upvotes") || "{}"
                );
                if (newState) {
                    localUpvotes[id] = true;
                } else {
                    delete localUpvotes[id];
                }
                localStorage.setItem("syncmaticaland_upvotes", JSON.stringify(localUpvotes));
            } catch {}
        }
        setUpvoteLoading(false);
    }, [id, upvoted, upvoteLoading, upvote, unupvote]);

    const handleStar = useCallback(async () => {
        if (starLoading) return;
        setStarLoading(true);
        const result = starred ? await unstar(id) : await star(id);
        if (result) {
            const newState = !starred;
            setStarred(newState);
            setStarDelta((prev) => prev + (newState ? 1 : -1));
            try {
                const localStars = JSON.parse(
                    localStorage.getItem("syncmaticaland_stars") || "{}"
                );
                if (newState) {
                    localStars[id] = true;
                } else {
                    delete localStars[id];
                }
                localStorage.setItem("syncmaticaland_stars", JSON.stringify(localStars));
            } catch {}
        }
        setStarLoading(false);
    }, [id, starred, starLoading, star, unstar]);

    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("链接已复制到剪贴板");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("复制失败，请手动复制链接");
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (!res?.schematic?.file_url) return;
        window.open(res.schematic.file_url, "_blank", "noopener,noreferrer");
    }, [res]);

    if (isLoading) {
        return (
            <PageShell
                leftCol={
                    <>
                        <Prime.ImageGallery skeleton images={[]} name="" />
                        <DescriptionCard skeleton />
                    </>
                }
                rightCol={
                    <>
                        <TitleAuthor skeleton />
                        <StatsRow skeleton />
                        <Shadcn.Separator />
                        <ActionButtons skeleton />
                        <Shadcn.Separator />
                        <MetaRows skeleton />
                    </>
                }
            />
        );
    }

    if (error || !res) {
        return (
            <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
                <AlertCircle className="size-16 text-destructive opacity-60" />
                <div className="text-center">
                    <p className="text-xl font-semibold">无法加载原理图</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {error?.message ?? "未知错误，请稍后重试。"}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Shadcn.Button variant="outline" onClick={() => refetch()}>
                        重试
                    </Shadcn.Button>
                    <Shadcn.Button variant="ghost" asChild>
                        <Link href="/schematics">返回市场</Link>
                    </Shadcn.Button>
                </div>
            </main>
        );
    }

    const { schematic: schematicData, categories } = res;
    const authorName =
        typeof schematicData.author_name === "string" && schematicData.author_name.trim()
            ? schematicData.author_name.trim()
            : "未知作者";
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
        <PageShell
            leftCol={
                <>
                    <Prime.ImageGallery
                        images={schematicData.images}
                        name={schematicData.name}
                    />
                    {schematicData.description && (
                        <DescriptionCard description={schematicData.description} />
                    )}
                </>
            }
            rightCol={
                <>
                    <TitleAuthor
                        name={schematicData.name}
                        authorName={authorName}
                        authorInitial={authorInitial}
                    />

                    <StatsRow
                        upvoteCount={upvoteCount}
                        starCount={starCount}
                        viewed={schematicData.viewed}
                    />

                    <Shadcn.Separator />

                    <ActionButtons
                        fileUrl={schematicData.file_url}
                        upvoted={upvoted}
                        upvoteLoading={upvoteLoading}
                        starred={starred}
                        starLoading={starLoading}
                        copied={copied}
                        onDownload={handleDownload}
                        onUpvote={handleUpvote}
                        onStar={handleStar}
                        onShare={handleShare}
                    />

                    <Shadcn.Separator />

                    <MetaRows
                        format={schematicData.format}
                        mcVersion={schematicData.mc_version}
                        createdAt={schematicData.created_at}
                    />

                    {categories && categories.length > 0 && (
                        <>
                            <Shadcn.Separator />
                            <div>
                                <p className="mb-2 text-sm font-medium">分类</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((cat) => (
                                        <Shadcn.Badge key={cat.id} variant="outline">
                                            {cat.name}
                                        </Shadcn.Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {schematicData.tags.length > 0 && (
                        <>
                            <Shadcn.Separator />
                            <div>
                                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                                    <Tag className="size-4" />
                                    标签
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {schematicData.tags.map((tag) => (
                                        <Shadcn.Badge key={tag} variant="secondary">
                                            {tag}
                                        </Shadcn.Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            }
        />
    );
}
