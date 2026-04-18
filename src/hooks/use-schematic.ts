"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Schematic, WrapSchema } from "@/schema";

export interface UseSchematicResult {
    schematic: Schematic.Schematic.SchematicRes | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useSchematic(id: string): UseSchematicResult {
    const [schematic, setSchematic] = useState<Schematic.Schematic.SchematicRes | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const hasFetchedRef = useRef(false);

    const doFetch = useCallback(() => {
        if (!id) {
            setSchematic(null);
            setIsLoading(false);
            return;
        }

        hasFetchedRef.current = false;

        const executeFetch = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {
                const res = await fetch(`/api/v1/schematics/${id}`, {
                    method: "GET",
                    cache: "no-store",
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch schematic: ${res.status}`);
                }
                const data = (await res.json()) as WrapSchema<Schematic.Schematic.SchematicRes>;
                setSchematic(data.data);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        };

        executeFetch();
    }, [id]);

    useEffect(() => {
        doFetch();
    }, [doFetch]);

    return { schematic, isLoading, error, refetch: doFetch };
}
