import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof window !== "undefined" ? window.navigator.onLine : true,
  setIsOnline: (isOnline) => set({ isOnline }),
}));
