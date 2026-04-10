import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TeamFooter from './components/TeamFooter';
import HomePage from './pages/HomePage';
import DatasetPage from './pages/DatasetPage';
import AnalysisPage from './pages/AnalysisPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PredictorPage from './pages/PredictorPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/predictor" element={<PredictorPage />} />
      </Routes>
      <TeamFooter />
    </BrowserRouter>
  );
}

export default App;
