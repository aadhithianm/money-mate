import type { AppErrorCode, ISODateString } from "./entities";

// ─── Base Application Error ──────────────────────────────────────────────────

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly timestamp: ISODateString;
  readonly details?: unknown;

  constructor(
    message: string,
    code: AppErrorCode = "UNKNOWN",
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.details = details;
    // Fix prototype chain for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      details: this.details,
    };
  }
}

// ─── Validation Error ────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  readonly fields: any;

  constructor(message: string, fields: any = {}) {
    super(message, "VALIDATION_ERROR", fields);
    this.name = "ValidationError";
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Database Error ──────────────────────────────────────────────────────────

export class DatabaseError extends AppError {
  readonly operation: string;

  constructor(message: string, operation: string, details?: unknown) {
    super(message, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
    this.operation = operation;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Sync Error ───────────────────────────────────────────────────────────────

export class SyncError extends AppError {
  readonly itemId?: string;
  readonly retryCount: number;

  constructor(
    message: string,
    retryCount: number = 0,
    itemId?: string,
    details?: unknown
  ) {
    super(message, "SYNC_ERROR", details);
    this.name = "SyncError";
    this.retryCount = retryCount;
    this.itemId = itemId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Network Error ───────────────────────────────────────────────────────────

export class NetworkError extends AppError {
  constructor(message: string = "No network connection") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Not Found Error ─────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  readonly entityType: string;
  readonly entityId: string;

  constructor(entityType: string, entityId: string) {
    super(`${entityType} with id "${entityId}" was not found`, "NOT_FOUND");
    this.name = "NotFoundError";
    this.entityType = entityType;
    this.entityId = entityId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Error Utility Functions ─────────────────────────────────────────────────

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN", { originalError: error.name });
  }
  return new AppError("An unexpected error occurred", "UNKNOWN", error);
}
