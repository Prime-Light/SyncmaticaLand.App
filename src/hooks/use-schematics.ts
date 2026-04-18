"use client";

import { useEffect, useState, useCallback } from "react";
import { Schematic, WrapSchema } from "@/schema";

export interface UseSchematicsOptions {
    status?: string;
    category_id?: string;
    author_id?: string;
    limit?: number;
    offset?: number;
}

export interface UseSchematicsResult {
    schematics: Schematic.Schematic.SchematicListRes | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useSchematics(options?: UseSchematicsOptions): UseSchematicsResult {
    const [schematics, setSchematics] = useState<Schematic.Schematic.SchematicListRes | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(() => {
        let mounted = true;
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options?.status) params.set("status", options.status);
        if (options?.category_id) params.set("category_id", options.category_id);
        if (options?.author_id) params.set("author_id", options.author_id);
        if (options?.limit !== undefined) params.set("limit", String(options.limit));
        if (options?.offset !== undefined) params.set("offset", String(options.offset));

        const queryString = params.toString();
        const url = `/api/v1/schematics${queryString ? `?${queryString}` : ""}`;

        fetch(url, { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch schematics: ${res.status}`);
                }
                return (await res.json()) as WrapSchema<Schematic.Schematic.SchematicListRes>;
            })
            .then((data) => {
                if (!mounted) return;
                setSchematics(data.data);
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
    }, [
        options?.status,
        options?.category_id,
        options?.author_id,
        options?.limit,
        options?.offset,
    ]);

    useEffect(() => {
        const cleanup = fetchData();
        return cleanup;
    }, [fetchData]);

    return { schematics, isLoading, error, refetch: fetchData };
}
