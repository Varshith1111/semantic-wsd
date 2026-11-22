import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PredictionProvider } from './context/PredictionContext';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import MeaningPredictor from './pages/MeaningPredictor';
import SemanticAnalysis from './pages/SemanticAnalysis';
import ContextVisualization from './pages/ContextVisualization';
import PredictionHistory from './pages/PredictionHistory';
import ModelEvaluation from './pages/ModelEvaluation';
import About from './pages/About';

export default function App() {
  return (
    <PredictionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="predict" element={<MeaningPredictor />} />
            <Route path="analysis" element={<SemanticAnalysis />} />
            <Route path="visualization" element={<ContextVisualization />} />
            <Route path="history" element={<PredictionHistory />} />
            <Route path="evaluation" element={<ModelEvaluation />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PredictionProvider>
  );
}
