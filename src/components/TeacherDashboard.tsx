import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  BarChart3,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Edit2,
} from 'lucide-react';
import { ModuleEditorModal } from './ModuleEditorModal';
import { QuizCreatorModal } from './QuizCreatorModal';
import { ModuleItem, Quiz } from '../types/ipas';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    modules,
    quizzes,
    submissions,
    deleteModule,
    deleteQuiz,
    togglePublishQuiz,
    setActiveTab,
    playChime,
  } = useApp();

  const [isModuleEditorOpen, setIsModuleEditorOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);

  const [isQuizCreatorOpen, setIsQuizCreatorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Computed metrics
  const completedSubs = submissions.filter((s) => s.status === 'selesai');
  const inProgressSubs = submissions.filter((s) => s.status === 'sedang_mengerjakan');
  const avgClassScore =
    completedSubs.length > 0
      ? Math.round(completedSubs.reduce((acc, curr) => acc + curr.percentage, 0) / completedSubs.length)
      : 80;
  const passedCount = completedSubs.filter((s) => s.passed).length;
  const passRate =
    completedSubs.length > 0 ? Math.round((passedCount / completedSubs.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Teacher Profile Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-1">
              <span>Dashboard Pengajar SMK PGRI 5 Surabaya</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Selamat Bertugas, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.department} • {currentUser.schoolName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingModule(null);
              setIsModuleEditorOpen(true);
              playChime('click');
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Modul</span>
          </button>

          <button
            onClick={() => {
              setEditingQuiz(null);
              setIsQuizCreatorOpen(true);
              playChime('click');
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Buat Kuis (7 Tipe / AI)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60">
              Materi
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{modules.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Modul IPAS</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <FileQuestion className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
              Asesmen
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {quizzes.filter((q) => q.isPublished).length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kuis Aktif (7 Format)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
              KKTP {quizzes[0]?.passingScore || 75}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{avgClassScore}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rata-rata Nilai Siswa</p>
        </div>

        <div
          onClick={() => setActiveTab('analisis')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <Users className="w-5 h-5" />
            {inProgressSubs.length > 0 && (
              <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 animate-pulse">
                <span>Live ({inProgressSubs.length})</span>
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {completedSubs.length} Siswa
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ketuntasan: <span className="font-bold text-emerald-600">{passRate}%</span>
          </p>
        </div>
      </div>

      {/* Quick Launch Banner to Real-Time Analytics */}
      <div
        onClick={() => {
          setActiveTab('analisis');
          playChime('click');
        }}
        className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              Pantau Analisis Performa Siswa Secara Real-Time
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Pantau siapa yang sedang mengerjakan kuis saat ini, diagnosis kelemahan materi IPAS dengan AI, dan unduh rekap nilai.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1 font-bold text-xs bg-white text-blue-700 px-3.5 py-2 rounded-xl shadow-xs">
          <span>Buka Analisis</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Tables: Manage Modules & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Management */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Kelola Materi & Modul IPAS</span>
            </h3>
            <button
              onClick={() => {
                setEditingModule(null);
                setIsModuleEditorOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Bab {m.chapterNumber}: {m.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.aspect} • {m.readTimeMinutes} menit
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingModule(m);
                      setIsModuleEditorOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus modul "${m.title}"?`)) deleteModule(m.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Management */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <FileQuestion className="w-4 h-4 text-indigo-600" />
              <span>Kelola Kuis (7 Tipe Format Soal)</span>
            </h3>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setIsQuizCreatorOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {q.title}
                    </p>
                    {q.isPublished ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Aktif"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" title="Nonaktif"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {q.questions.length} Butir Soal • Durasi: {q.durationMinutes}m • KKTP: {q.passingScore}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => togglePublishQuiz(q.id)}
                    className={`p-1.5 rounded-lg ${
                      q.isPublished ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    title={q.isPublished ? 'Publikasikan' : 'Sembunyikan'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuiz(q);
                      setIsQuizCreatorOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kuis "${q.title}"?`)) deleteQuiz(q.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModuleEditorModal
        isOpen={isModuleEditorOpen}
        onClose={() => {
          setIsModuleEditorOpen(false);
          setEditingModule(null);
        }}
        editItem={editingModule}
      />

      <QuizCreatorModal
        isOpen={isQuizCreatorOpen}
        onClose={() => {
          setIsQuizCreatorOpen(false);
          setEditingQuiz(null);
        }}
        editQuiz={editingQuiz}
      />
    </div>
  );
};
