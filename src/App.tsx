/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ModuleList } from './components/ModuleList';
import { QuizList } from './components/QuizList';
import { TeacherDashboard } from './components/TeacherDashboard';
import { RealtimeAnalytics } from './components/RealtimeAnalytics';
import { SettingsView } from './components/SettingsView';
import { AITutorDrawer } from './components/AITutorDrawer';
import { GraduationCap, Heart, MapPin, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, activeQuiz } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navbar is only hidden if in fullscreen quiz mode, but keeping it visible provides seamless exit */}
      {!activeQuiz && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'materi' && <ModuleList />}
        {activeTab === 'kuis' && <QuizList />}
        {activeTab === 'dashboard' && <TeacherDashboard />}
        {activeTab === 'analisis' && <RealtimeAnalytics />}
        {activeTab === 'pengaturan' && <SettingsView />}
      </main>

      {/* Floating AI Tutor Drawer */}
      {!activeQuiz && <AITutorDrawer />}

      {/* School Footer */}
      {!activeQuiz && (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  SMK PGRI 5 Surabaya • Projek IPAS
                </p>
                <p className="text-[11px] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Surabaya, Jawa Timur • Terakreditasi • Berbasis Google AI Studio</span>
                </p>
              </div>
            </div>

            <div className="text-center md:text-right text-[11px]">
              <p>Platform Asesmen & Pembelajaran IPAS Berbasis AI Vokasi</p>
              <p className="mt-0.5 opacity-80">
                Pilihan Ganda Sederhana • PG Kompleks • Benar/Salah • BS Kompleks • Menjodohkan • Isian Singkat • Uraian
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
