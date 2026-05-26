import type { Transaction } from "@/types/entities";

export type FinancialEventType =
  | "transaction_created"
  | "transaction_updated"
  | "transaction_deleted"
  | "low_balance"
  | "balance_milestone"
  | "sync_triggered";

export interface FinancialEvent {
  id: string;
  type: FinancialEventType;
  message: string;
  timestamp: string;
  metadata?: {
    transaction?: Transaction;
    transactionId?: string;
    accountId?: string;
    accountName?: string;
    balance?: number;
    delta?: number;
    [key: string]: any;
  };
}

type FinancialEventListener = (event: FinancialEvent) => void;

class FinancialEventService {
  private listeners = new Set<FinancialEventListener>();

  /**
   * Subscribe to financial events. Returns an unsubscribe function.
   */
  subscribe(listener: FinancialEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit a new financial event to all subscribers.
   */
  emit(
    type: FinancialEventType,
    message: string,
    metadata?: FinancialEvent["metadata"]
  ): void {
    const event: FinancialEvent = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    console.log(`[FinancialEventService] Emitting [${type}]: ${message}`, metadata);

    // Call all listeners asynchronously
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("[FinancialEventService] Listener execution failed:", err);
      }
    });
  }
}

export const financialEventService = new FinancialEventService();
