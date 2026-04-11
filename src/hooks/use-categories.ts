"use client";

import { useEffect, useState } from "react";
import { Schematic, WrapSchema } from "@/schema";

export interface UseCategoriesResult {
    categories: Schematic.Category.CategoryListRes | null;
    isLoading: boolean;
    error: Error | null;
}

export function useCategories(): UseCategoriesResult {
    const [categories, setCategories] = useState<Schematic.Category.CategoryListRes | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        setError(null);

        fetch("/api/v1/categories", { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch categories: ${res.status}`);
                }
                return (await res.json()) as WrapSchema<Schematic.Category.CategoryListRes>;
            })
            .then((data) => {
                if (!mounted) return;
                setCategories(data.data);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err instanceof Error ? err : new Error(String(err)));
            })
            .finally(() => {
                if (mounted) setIsLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return { categories, isLoading, error };
}
