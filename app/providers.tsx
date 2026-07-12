"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bootstrapAuth } from "@/lib/api/auth";

// Restore the session once on mount: exchange the httpOnly refresh cookie for a
// fresh access token so a page reload doesn't log the user out.
function AuthBootstrap() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);
  return null;
}

// App-wide client providers. react-query needs a QueryClient available via
// context for useMutation/useQuery to work. Created once per browser session
// with useState so it survives re-renders but isn't shared across requests.
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      {children}
    </QueryClientProvider>
  );
}
