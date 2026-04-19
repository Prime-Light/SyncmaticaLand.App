"use client";

import { useEffect, useState, useCallback } from "react";
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

    const doFetch = useCallback(() => {
        if (!id) {
            setSchematic(null);
            setIsLoading(false);
            return;
        }

        let mounted = true;
        setIsLoading(true);
        setError(null);

        const executeFetch = async () => {
            if (!mounted) return;

            try {
                const res = await fetch(`/api/v1/schematics/${id}`, {
                    method: "GET",
                    cache: "no-store",
                });
                if (!mounted) return;

                if (!res.ok) {
                    throw new Error(`Failed to fetch schematic: ${res.status}`);
                }
                const data = (await res.json()) as WrapSchema<Schematic.Schematic.SchematicRes>;
                if (!mounted) return;

                setSchematic(data.data);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        };

        executeFetch();
        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        return doFetch();
    }, [doFetch]);

    return { schematic, isLoading, error, refetch: doFetch };
}
