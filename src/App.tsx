import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SimulatorProvider } from './context/SimulatorContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { BankersPage } from './pages/BankersPage';
import { DeadlockDetectionPage } from './pages/DeadlockDetectionPage';
import { ResourceAllocationPage } from './pages/ResourceAllocationPage';
import { SimulationPage } from './pages/SimulationPage';
import { LearnPage } from './pages/LearnPage';
import { SamplesPage } from './pages/SamplesPage';
import { VivaPage } from './pages/VivaPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <SimulatorProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bankers" element={<BankersPage />} />
            <Route path="/deadlock-detection" element={<DeadlockDetectionPage />} />
            <Route path="/resource-allocation" element={<ResourceAllocationPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/samples" element={<SamplesPage />} />
            <Route path="/viva" element={<VivaPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SimulatorProvider>
  );
}
