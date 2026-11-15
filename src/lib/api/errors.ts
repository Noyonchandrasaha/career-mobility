import type { ApiErrorCode } from "@/types/api"
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
  }
}
export function unavailable() {
  return new ApiError(
    503,
    "SERVICE_UNAVAILABLE",
    "The data service is unavailable. Please retry."
  )
}
export function notFound(message = "Resource not found.") {
  return new ApiError(404, "NOT_FOUND", message)
}
export function unauthorized() {
  return new ApiError(
    401,
    "UNAUTHORIZED",
    "Your session is unavailable. Please retry session initialization."
  )
}
