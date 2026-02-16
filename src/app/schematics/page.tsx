"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";

export interface Schematic {
    id: number;
    name: string;
    author: string;
    category: string;
    downloads: number;
}

export default function SchematicsPage() {
    const [schematics, setSchematics] = useState<Schematic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSchematics();
    }, []);

    async function fetchSchematics() {
        try {
            setLoading(true);
            const response = await fetch("/api/schematics?limit=8");
            const data = await response.json();

            if (data.success) {
                setSchematics(data.data);
            } else {
                setError("获取数据失败");
            }
        } catch (err) {
            setError(`获取数据失败: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(id: number) {
        try {
            const response = await fetch(`/api/schematics/${id}`, {
                method: "PUT",
            });
            const data = await response.json();

            if (data.success) {
                alert("下载成功！");
                fetchSchematics();
            }
        } catch (err) {
            alert(`下载失败: ${err}`);
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10 flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">原理图库</h1>
                <p className="text-muted-foreground">浏览和下载 Minecraft 投影原理图</p>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {schematics.map((schematic) => (
                    <Card key={schematic.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-3">
                                <Download className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <CardTitle className="text-lg">{schematic.name}</CardTitle>
                            <CardDescription>by {schematic.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary">{schematic.category || "未分类"}</Badge>
                                <Button size="sm" onClick={() => handleDownload(schematic.id)}>
                                    <Download className="h-4 w-4 mr-1" />
                                    {schematic.downloads}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
