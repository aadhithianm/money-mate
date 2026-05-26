import { db } from "@/db/DexieDB";
import { supabase } from "@/lib/supabase";
import type { SyncQueueItem } from "@/types/entities";
import { useNetworkStore } from "@/stores/networkStore";

class SyncQueue {
  private isProcessing = false;

  async startSync(): Promise<void> {
    if (this.isProcessing) return;
    if (!useNetworkStore.getState().isOnline) {
      console.log("[SyncQueue] Browser is offline. Skipping sync sweep.");
      return;
    }

    // Check if Supabase is actually configured
    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    this.isProcessing = true;
    console.log("[SyncQueue] Starting background sync run. Mock sync mode:", isMock);

    try {
      // Find all pending or failed items, sorted by compound status/created_at
      const queueItems = await db.sync_queue
        .where("status")
        .anyOf("PENDING", "FAILED")
        .toArray();

      if (queueItems.length === 0) {
        console.log("[SyncQueue] Queue is empty. Nothing to sync.");
        return;
      }

      // Sort by created_at ascending (sequential order)
      queueItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const item of queueItems) {
        if (item.retry_count >= 5) {
          console.warn(`[SyncQueue] Skipping item ${item.id} because it exceeded max retries.`);
          continue;
        }
        await this.processItem(item, isMock);
      }
    } catch (err) {
      console.error("[SyncQueue] Error during sync sweep:", err);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: SyncQueueItem, isMock: boolean): Promise<void> {
    // Update status to SYNCING
    await db.sync_queue.update(item.id, {
      status: "SYNCING",
      updated_at: new Date().toISOString(),
    });

    try {
      if (isMock) {
        // Simulate network latency in dev/mock environment
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        // Map entity type to Supabase table
        const tableMap: Record<string, string> = {
          transaction: "transactions",
          account: "accounts",
          category: "categories",
          workspace: "workspaces",
          settings: "settings",
        };

        const tableName = tableMap[item.entity_type];
        if (!tableName) {
          throw new Error(`Unknown entity type: ${item.entity_type}`);
        }

        // Apply operation to remote database
        if (item.operation === "CREATE") {
          const { error } = await supabase.from(tableName).insert(item.payload);
          if (error) throw error;
        } else if (item.operation === "UPDATE") {
          const { error } = await supabase
            .from(tableName)
            .update(item.payload)
            .eq("id", item.entity_id);
          if (error) throw error;
        } else if (item.operation === "DELETE") {
          // Soft delete is an update that marks deleted_at
          const { error } = await supabase
            .from(tableName)
            .update(item.payload)
            .eq("id", item.entity_id);
          if (error) throw error;
        }
      }

      // Success! Update status to DONE
      await db.sync_queue.update(item.id, {
        status: "DONE",
        updated_at: new Date().toISOString(),
      });
      
      console.log(`[SyncQueue] Successfully synced ${item.entity_type} (${item.operation}) — ID: ${item.entity_id}`);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      const nextRetryCount = item.retry_count + 1;
      const nextStatus = nextRetryCount >= 5 ? "FAILED" : "PENDING";

      await db.sync_queue.update(item.id, {
        status: nextStatus,
        retry_count: nextRetryCount,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      });

      console.error(`[SyncQueue] Failed to sync item ${item.id} (Retry ${nextRetryCount}/5):`, errorMessage);
    }
  }

  // Helper method to enqueue and trigger sync immediately in the background
  async triggerSync(): Promise<void> {
    // Run asynchronously without blocking the main thread
    this.startSync().catch((err) => {
      console.error("[SyncQueue] Failed in async triggerSync:", err);
    });
  }
}

export const syncQueue = new SyncQueue();
