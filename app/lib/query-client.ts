import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分
      retry: (failureCount, error: any) => {
        // 認証エラー・認可エラーはリトライしない
        if (error?.status === 401 || error?.status === 403) return false;
        // 4xx系は基本リトライしない
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
