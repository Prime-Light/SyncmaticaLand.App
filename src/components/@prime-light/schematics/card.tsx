import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Download } from "lucide-react";
import { Shadcn } from "@/components";
import { Schematic } from "@/schema";

export type SchematicCardProps = Schematic.Schematic.Schematic;

function formatCount(count: number): string {
    if (count > 999999) return `${(count / 1000000).toFixed(1)}m`;
    if (count > 999) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
}

export function SchematicCard({
    id,
    name,
    description,
    format,
    mc_version,
    images,
    upvotes,
    starred,
    viewed,
}: SchematicCardProps) {
    const previewImage = images?.[0];

    return (
        <Link href={`/schematics/${id}`}>
            <Shadcn.Card className="group overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
                <div className="relative -mx-6 -mt-6 aspect-video overflow-hidden rounded-xl bg-muted">
                    {previewImage ? (
                        <Image
                            src={previewImage}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/80 to-muted">
                            <span className="text-sm text-muted-foreground">原理图预览</span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/80 via-background/40 to-transparent" />
                </div>

                <Shadcn.CardHeader className="space-y-2 p-4 pt-3">
                    <Shadcn.CardTitle className="line-clamp-1 text-base font-semibold">
                        {name}
                    </Shadcn.CardTitle>
                    <Shadcn.CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {description ?? "暂无描述"}
                    </Shadcn.CardDescription>
                </Shadcn.CardHeader>

                <Shadcn.CardFooter className="flex items-center justify-between border-0 bg-transparent p-4 pt-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-medium text-primary">
                                {format.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{mc_version}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Heart className="size-4" />
                            <span className="text-xs">{formatCount(upvotes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Download className="size-4" />
                            <span className="text-xs">{formatCount(starred)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="size-4" />
                            <span className="text-xs">{formatCount(viewed)}</span>
                        </div>
                    </div>
                </Shadcn.CardFooter>
            </Shadcn.Card>
        </Link>
    );
}
