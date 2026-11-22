import { useState, useCallback } from 'react';
import type { PredictionResponse } from '../types';
import { analyzeMeaning } from '../services/api';

export function usePrediction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const predict = useCallback(async (sentence: string, targetWord: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMeaning(sentence, targetWord);
      setResult(data);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Prediction failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, error, result, predict, clear, setResult };
}
