"use client";

import { useEffect, useState, useRef } from "react";
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
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        hasFetchedRef.current = false;

        const executeFetch = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            const params = new URLSearchParams();
            if (options?.status) params.set("status", options.status);
            if (options?.category_id) params.set("category_id", options.category_id);
            if (options?.author_id) params.set("author_id", options.author_id);
            if (options?.limit !== undefined) params.set("limit", String(options.limit));
            if (options?.offset !== undefined) params.set("offset", String(options.offset));

            const queryString = params.toString();
            const url = `/api/v1/schematics${queryString ? `?${queryString}` : ""}`;

            try {
                const res = await fetch(url, { method: "GET", cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`Failed to fetch schematics: ${res.status}`);
                }
                const data = (await res.json()) as WrapSchema<Schematic.Schematic.SchematicListRes>;
                setSchematics(data.data);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        };

        executeFetch();
    }, [options?.status, options?.category_id, options?.author_id, options?.limit, options?.offset]);

    const refetch = () => {
        hasFetchedRef.current = false;
        setSchematics(null);
        setIsLoading(true);
        setError(null);
    };

    return { schematics, isLoading, error, refetch };
}
