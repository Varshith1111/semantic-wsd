import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PredictionResponse } from '../types';

interface PredictionContextValue {
  prediction: PredictionResponse | null;
  setPrediction: (p: PredictionResponse | null) => void;
}

const PredictionContext = createContext<PredictionContextValue>({
  prediction: null,
  setPrediction: () => {},
});

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  return (
    <PredictionContext.Provider value={{ prediction, setPrediction }}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePredictionContext() {
  return useContext(PredictionContext);
}
