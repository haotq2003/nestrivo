"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Dữ liệu tươi mới trong 5 phút
            gcTime: 1000 * 60 * 30, // Lưu cache tối đa 30 phút
            refetchOnWindowFocus: false, // Không spam refetch khi focus lại tab
            retry: 1, // Tự động thử lại 1 lần nếu gặp lỗi mạng
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
