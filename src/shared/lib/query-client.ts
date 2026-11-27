import { isServer, QueryClient } from "@tanstack/react-query";
import { cache } from "react";

import { queryCacheConfig } from "@/shared/config/query-cache";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryCacheConfig.default.staleTime,
        gcTime: queryCacheConfig.default.gcTime,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};

// Один клиент на серверный запрос: prefetch в RSC и HydrationBoundary делят кэш.
export const getServerQueryClient = cache(makeQueryClient);
