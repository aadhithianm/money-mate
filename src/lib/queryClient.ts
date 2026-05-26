import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      refetchOnWindowFocus: false, // Turn off automatic refetching on focus
      retry: false, // Fail fast since network operations should succeed locally first
    },
  },
});
