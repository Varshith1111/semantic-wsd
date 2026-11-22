import { useState, useCallback } from 'react';
import type { HistoryItem } from '../types';
import {
  getHistory as fetchHistory,
  clearHistory as deleteHistory,
} from '../services/api';

export function useHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setItems(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load history';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteHistory();
      setItems([]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to clear history';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, items, load, clear };
}
