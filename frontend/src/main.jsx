import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import AppLayout from './components/AppLayout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ResumeDashboard from './pages/ResumeDashboard.jsx';
import ResumeEditorPage from './pages/ResumeEditorPage.jsx';
import TemplateSelectorPage from './pages/TemplateSelectorPage.jsx';
import ResumeAnalyzerPage from './pages/ATSAnalyzerPage.jsx';
import PublicResumePage from './pages/PublicResumePage.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume" element={<ResumeDashboard />} />
            <Route path="/resume/:username" element={<PublicResumePage />} />
            <Route path="/editor" element={<ResumeEditorPage />} />
            <Route path="/templates" element={<TemplateSelectorPage />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/ats-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
