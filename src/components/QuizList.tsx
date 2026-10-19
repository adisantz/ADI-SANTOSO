import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Quiz } from '../types/ipas';
import {
  FileQuestion,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { QuizPlayer } from './QuizPlayer';
import { QuizCreatorModal } from './QuizCreatorModal';

export const QuizList: React.FC = () => {
  const {
    quizzes,
    currentUser,
    submissions,
    deleteQuiz,
    togglePublishQuiz,
    activeQuiz,
    setActiveQuiz,
    playChime,
  } = useApp();

  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // If a quiz is active, render QuizPlayer
  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} onExit={() => setActiveQuiz(null)} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold mb-3">
            <FileQuestion className="w-3.5 h-3.5 text-amber-300" />
            <span>Bank Asesmen & Penilaian IPAS Kurikulum Merdeka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kuis & Tugas Asesmen Siswa
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Asesmen dirancang lengkap dengan 7 format soal: Pilihan Ganda Sederhana, PG Kompleks, Benar/Salah, BS Kompleks, Menjodohkan, Isian Singkat, dan Uraian Analitis HOTS.
          </p>
        </div>

        {currentUser.role === 'guru' && (
          <div className="mt-5 sm:mt-0 sm:absolute sm:right-8 sm:bottom-8 z-10">
            <button
              onClick={() => {
                setEditingQuiz(null);
                setIsCreatorOpen(true);
                playChime('click');
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Kuis Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => {
          // Check if current student has taken this quiz
          const studentSub = submissions.find(
            (s) => s.quizId === quiz.id && s.studentId === currentUser.id && s.status === 'selesai'
          );

          // Unique question types present in this quiz
          const presentTypes = Array.from(new Set(quiz.questions.map((q) => q.type)));

          return (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                    {quiz.aspect}
                  </span>

                  {currentUser.role === 'guru' ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => togglePublishQuiz(quiz.id)}
                        title={quiz.isPublished ? 'Kuis Aktif (Klik untuk sembunyikan)' : 'Kuis Disembunyikan'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          quiz.isPublished
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {quiz.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setIsCreatorOpen(true);
                        }}
                        title="Edit Kuis"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus kuis "${quiz.title}"?`)) {
                            deleteQuiz(quiz.id);
                          }
                        }}
                        title="Hapus Kuis"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : studentSub ? (
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        studentSub.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {studentSub.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Skor: {studentSub.percentage}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      Belum Dikerjakan
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {quiz.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {quiz.description}
                </p>

                {/* Question Type Badges (Showing 7 formats) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Format Soal Tersedia ({presentTypes.length} Tipe):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {presentTypes.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize"
                      >
                        ✓ {t.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Classes */}
                <div className="mt-3 text-[11px] text-slate-500">
                  <span>Sasaran: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {quiz.targetClasses.join(', ')}
                  </span>
                </div>
              </div>

              {/* Footer Specs & Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.durationMinutes} Menit</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>KKTP: {quiz.passingScore}</span>
                  </div>
                  <span>•</span>
                  <span>{quiz.questions.length} Butir</span>
                </div>

                <button
                  onClick={() => {
                    setActiveQuiz(quiz);
                    playChime('click');
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{studentSub ? 'Ulangi / Latihan' : 'Mulai Kerjakan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creator Modal */}
      <QuizCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingQuiz(null);
        }}
        editQuiz={editingQuiz}
      />
    </div>
  );
};
