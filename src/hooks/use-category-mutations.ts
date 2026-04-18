"use client";

import { useState, useCallback } from "react";
import { Schematic, WrapSchema } from "@/schema";

export interface UseCreateCategoryResult {
    createCategory: (data: Schematic.Category.CreateCategoryReq) => Promise<Schematic.Category.CategoryRes | null>;
    isLoading: boolean;
    error: Error | null;
}

export function useCreateCategory(): UseCreateCategoryResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createCategory = useCallback(async (data: Schematic.Category.CreateCategoryReq): Promise<Schematic.Category.CategoryRes | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/v1/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error(`Failed to create category: ${res.status}`);
            }

            const result = (await res.json()) as WrapSchema<Schematic.Category.CategoryRes>;
            return result.data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createCategory, isLoading, error };
}

export interface UseUpdateCategoryResult {
    updateCategory: (data: Schematic.Category.UpdateCategoryReq) => Promise<Schematic.Category.CategoryRes | null>;
    isLoading: boolean;
    error: Error | null;
}

export function useUpdateCategory(id: string): UseUpdateCategoryResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateCategory = useCallback(async (data: Schematic.Category.UpdateCategoryReq): Promise<Schematic.Category.CategoryRes | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error(`Failed to update category: ${res.status}`);
            }

            const result = (await res.json()) as WrapSchema<Schematic.Category.CategoryRes>;
            return result.data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    return { updateCategory, isLoading, error };
}

export interface UseDeleteCategoryResult {
    deleteCategory: () => Promise<boolean>;
    isLoading: boolean;
    error: Error | null;
}

export function useDeleteCategory(id: string): UseDeleteCategoryResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteCategory = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed to delete category: ${res.status}`);
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

    return { deleteCategory, isLoading, error };
}
