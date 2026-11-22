import axios from 'axios';
import type {
  PredictionResponse,
  HistoryItem,
  EvaluationResult,
  HealthCheck,
} from '../types';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

export async function predictMeaning(
  sentence: string,
  target_word: string
): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>('/api/predict', {
    sentence,
    target_word,
  });
  return data;
}

export async function analyzeMeaning(
  sentence: string,
  target_word: string
): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>('/api/analyze', {
    sentence,
    target_word,
  });
  return data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await api.get<HistoryItem[]>('/api/history');
  return data;
}

export async function getHistoryItem(id: number): Promise<PredictionResponse> {
  const { data } = await api.get<PredictionResponse>(`/api/history/${id}`);
  return data;
}

export async function clearHistory(): Promise<void> {
  await api.delete('/api/history');
}

export async function getEvaluation(): Promise<EvaluationResult> {
  const { data } = await api.get<EvaluationResult>('/api/evaluation');
  return data;
}

export async function healthCheck(): Promise<HealthCheck> {
  const { data } = await api.get<HealthCheck>('/api/health');
  return data;
}
