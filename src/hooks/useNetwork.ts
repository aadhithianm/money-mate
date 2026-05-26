import { useEffect } from "react";
import { useNetworkStore } from "@/stores/networkStore";
import { syncQueue } from "@/sync/SyncQueue";

export function useNetwork() {
  const setIsOnline = useNetworkStore((state) => state.setIsOnline);
  const isOnline = useNetworkStore((state) => state.isOnline);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      console.log("[useNetwork] Browser toggled ONLINE. Launching sync sweep.");
      syncQueue.startSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[useNetwork] Browser toggled OFFLINE.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial mount check and run sync if online
    if (window.navigator.onLine) {
      setIsOnline(true);
      syncQueue.startSync();
    } else {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline]);

  return { isOnline };
}
