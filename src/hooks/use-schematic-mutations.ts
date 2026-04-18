"use client";

import { useState, useCallback } from "react";
import { Schematic, WrapSchema } from "@/schema";

export interface UseCreateSchematicResult {
    createSchematic: (
        data: Schematic.Schematic.CreateSchematicReq
    ) => Promise<Schematic.Schematic.SchematicRes | null>;
    isLoading: boolean;
    error: Error | null;
}

export function useCreateSchematic(): UseCreateSchematicResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createSchematic = useCallback(
        async (
            data: Schematic.Schematic.CreateSchematicReq
        ): Promise<Schematic.Schematic.SchematicRes | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/v1/schematics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    throw new Error(`Failed to create schematic: ${res.status}`);
                }

                const result =
                    (await res.json()) as WrapSchema<Schematic.Schematic.SchematicRes>;
                return result.data;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { createSchematic, isLoading, error };
}

export interface UseUpdateSchematicResult {
    updateSchematic: (
        data: Schematic.Schematic.UpdateSchematicReq
    ) => Promise<Schematic.Schematic.SchematicRes | null>;
    isLoading: boolean;
    error: Error | null;
}

export function useUpdateSchematic(id: string): UseUpdateSchematicResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateSchematic = useCallback(
        async (
            data: Schematic.Schematic.UpdateSchematicReq
        ): Promise<Schematic.Schematic.SchematicRes | null> => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/v1/schematics/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    throw new Error(`Failed to update schematic: ${res.status}`);
                }

                const result =
                    (await res.json()) as WrapSchema<Schematic.Schematic.SchematicRes>;
                return result.data;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [id]
    );

    return { updateSchematic, isLoading, error };
}

export interface UseDeleteSchematicResult {
    deleteSchematic: () => Promise<boolean>;
    isLoading: boolean;
    error: Error | null;
}

export function useDeleteSchematic(id: string): UseDeleteSchematicResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteSchematic = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/schematics/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed to delete schematic: ${res.status}`);
            }

            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    return { deleteSchematic, isLoading, error };
}

export interface UseEngagementResult {
    upvote: (schematicId: string) => Promise<Schematic.Engagement.EngagementRes | null>;
    unupvote: (schematicId: string) => Promise<Schematic.Engagement.EngagementRes | null>;
    star: (schematicId: string) => Promise<Schematic.Engagement.EngagementRes | null>;
    unstar: (schematicId: string) => Promise<Schematic.Engagement.EngagementRes | null>;
}

export function useEngagement(): UseEngagementResult {
    const engagementAction = useCallback(
        async (
            action: "upvote" | "star",
            schematicId: string,
            method: "POST" | "DELETE" = "POST"
        ): Promise<Schematic.Engagement.EngagementRes | null> => {
            try {
                const res = await fetch(`/api/v1/schematics/${schematicId}/${action}`, {
                    method,
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    throw new Error(`Failed to ${action} schematic: ${res.status}`);
                }

                const result =
                    (await res.json()) as WrapSchema<Schematic.Engagement.EngagementRes>;
                return result.data;
            } catch {
                return null;
            }
        },
        []
    );

    const upvote = useCallback(
        (schematicId: string) => engagementAction("upvote", schematicId, "POST"),
        [engagementAction]
    );

    const unupvote = useCallback(
        (schematicId: string) => engagementAction("upvote", schematicId, "DELETE"),
        [engagementAction]
    );

    const star = useCallback(
        (schematicId: string) => engagementAction("star", schematicId, "POST"),
        [engagementAction]
    );

    const unstar = useCallback(
        (schematicId: string) => engagementAction("star", schematicId, "DELETE"),
        [engagementAction]
    );

    return { upvote, unupvote, star, unstar };
}
