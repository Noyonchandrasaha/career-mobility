export type ApiErrorCode =
  | "FORBIDDEN"
  | "PAYLOAD_TOO_LARGE"
  | "MODE_LOCAL_ONLY"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode
    message: string
    details?: Record<string, unknown>
  }
}
