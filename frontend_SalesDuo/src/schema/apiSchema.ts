import { z } from "zod";

export const OriginalSnapshotSchema = z
  .object({
    id: z.number().optional(),
    asin: z.string().optional(),
    title: z.string().nullable().optional(),
    bullets: z.array(z.string()).optional().default([]),
    description: z.string().nullable().optional(),
    fetched_at: z.string().nullable().optional(),
    source_url: z.string().nullable().optional(),
  })

export type OriginalSnapshot = z.infer<typeof OriginalSnapshotSchema>;

export const OptimizedSnapshotSchema = z
  .object({
    id: z.number().optional(),
    title: z.string().nullable().optional(),
    bullets: z.array(z.string()).optional().default([]),
    description: z.string().nullable().optional(),
    keywords: z.array(z.string()).optional().default([]),
    ai_model: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type OptimizedSnapshot = z.infer<typeof OptimizedSnapshotSchema>;

export const RunListItemSchema = z
  .object({
    id: z.number(),
    asin: z.string(),
    created_at: z.string(),
    run_label: z.string().nullable().optional(),
    optimized: OptimizedSnapshotSchema.nullable().optional(),
    original: OriginalSnapshotSchema.nullable().optional(),
  })
  .passthrough();

export type RunListItem = z.infer<typeof RunListItemSchema>;

export const RunsListResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    count: z.number().optional(),
    results: z.array(RunListItemSchema).optional(),
    runs: z.array(RunListItemSchema).optional(),
  })
  .passthrough();

export type RunsListResponse = z.infer<typeof RunsListResponseSchema>;

export const RunDetailSchema = z
  .object({
    id: z.number(),
    label: z.string().nullable().optional(),
    created_at: z.string(),
    optimized: OptimizedSnapshotSchema.nullable().optional(),
    original: OriginalSnapshotSchema.nullable().optional(),
  })
  .passthrough();

export type RunDetail = z.infer<typeof RunDetailSchema>;

export const RunsForAsinResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    asin: z.string(),
    count: z.number().optional(),
    runs: z.array(RunDetailSchema),
  })
  .passthrough();

export type RunsForAsinResponse = z.infer<typeof RunsForAsinResponseSchema>;

export const PostRunResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    run: RunDetailSchema.nullable().optional(),
    original: OriginalSnapshotSchema.nullable().optional(),
    optimized: OptimizedSnapshotSchema.nullable().optional(),
    runId: z.number().optional(),
  })
  .passthrough();

export type PostRunResponse = z.infer<typeof PostRunResponseSchema>;

export const ApiErrorSchema = z
  .object({
    error: z.string().optional(),
    code: z.union([z.number(), z.string()]).optional(),
    message: z.string().optional(),
    details: z.any().optional(),
  })
  .passthrough();

export type ApiError = z.infer<typeof ApiErrorSchema>;
