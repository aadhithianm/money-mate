import { workspaceRepository } from "@/repositories/WorkspaceRepository";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Workspace } from "@/types/entities";

export class WorkspaceService {
  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const result = createWorkspaceSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid workspace fields", result.error.format());
    }

    const workspace = await workspaceRepository.createWorkspace(result.data);
    syncQueue.triggerSync();
    return workspace;
  }

  async getWorkspaceById(id: string): Promise<Workspace | undefined> {
    return await workspaceRepository.findById(id);
  }

  async getWorkspaces(): Promise<Workspace[]> {
    // In Dexie, we fetch workspaces globally (or scoped by user id if synced).
    // For local operations, we return all workspaces.
    try {
      return await workspaceRepository.listAll();
    } catch {
      return [];
    }
  }

  async getDefaultWorkspace(): Promise<Workspace | undefined> {
    return await workspaceRepository.getDefault();
  }
}

export const workspaceService = new WorkspaceService();
