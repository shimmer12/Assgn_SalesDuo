// src/utils/validateApi.ts
import type { AxiosResponse } from "axios";
import { z } from "zod";

export class ApiValidationError extends Error {
  public details: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = "ApiValidationError";
    this.details = details;
  }
}

export function validateResponse<T>(res: AxiosResponse, schema: z.ZodType<T>): T {
  try {
    const parsed = schema.parse(res.data);
    return parsed as T;
  } catch (e: any) {
    throw new ApiValidationError("API response validation failed", {
      issues: e?.issues ?? e?.message ?? e,
      raw: res.data,
    });
  }
}
