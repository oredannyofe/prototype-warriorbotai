import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'warriorbot-query-cache',
  throttleTime: 1000,
});

export async function initQueryPersistence() {
  persistQueryClient({
    queryClient,
    persister,
dehydrateOptions: { shouldDehydrateQuery: (q: any) => q.state.status === 'success' },
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });
}
