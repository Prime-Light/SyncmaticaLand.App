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

    const fetchData = useCallback(() => {
        if (!id) {
            setSchematic(null);
            setIsLoading(false);
            return () => {};
        }

        let mounted = true;
        setIsLoading(true);
        setError(null);

        fetch(`/api/v1/schematics/${id}`, { method: "GET", cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch schematic: ${res.status}`);
                }
                return (await res.json()) as WrapSchema<Schematic.Schematic.SchematicRes>;
            })
            .then((data) => {
                if (!mounted) return;
                setSchematic(data.data);
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
    }, [id]);

    useEffect(() => {
        const cleanup = fetchData();
        return cleanup;
    }, [fetchData]);

    return { schematic, isLoading, error, refetch: fetchData };
}
