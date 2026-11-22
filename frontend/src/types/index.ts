export interface CandidateMeaning {
  definition: string;
  pos: string;
  synset_name: string;
  first_order_score: number;
  second_order_score: number;
  combined_score: number;
  examples: string[];
}

export interface PredictionResponse {
  id?: number;
  sentence: string;
  target_word: string;
  predicted_meaning: string;
  confidence: number;
  similarity_score: number;
  first_order_score: number;
  second_order_score: number;
  alternative_meanings: CandidateMeaning[];
  explanation: string;
  context_words: string[];
  pos_tags: [string, string][];
  processing_time: number;
}

export interface HistoryItem {
  id: number;
  sentence: string;
  target_word: string;
  predicted_meaning: string;
  confidence: number;
  similarity_score: number;
  created_at: string;
}

export interface EvaluationResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_samples: number;
  correct_predictions: number;
  dataset_name: string;
  confusion_matrix: Record<string, Record<string, number>>;
  per_word_accuracy: Record<string, number>;
}

export interface HealthCheck {
  status: string;
  model_loaded: boolean;
  database_connected: boolean;
}
