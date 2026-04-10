import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 1 time (not 3) — faster UX
      retry: 1,
      // Consider data fresh for 30s
      staleTime: 30_000,
      // Refetch on window focus for live data feel
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Sonner toast — Industrial theme */}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-strong)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          },
        }}
      />

      {/* React Query Devtools — dev only */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
