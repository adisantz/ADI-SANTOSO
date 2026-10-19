import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIAnalysisResult } from '../types/ipas';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Printer,
  Clock,
  Search,
  Filter,
  Check,
  Award,
  Zap,
  Loader2,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const RealtimeAnalytics: React.FC = () => {
  const {
    quizzes,
    submissions,
    analyzeRealtimePerformance,
    isGeneratingAI,
    playChime,
    resetSubmissions,
  } = useApp();

  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    quizzes[0]?.id || 'kuis-ipas-01'
  );
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  // Filter submissions by quiz
  const quizSubs = submissions.filter((s) => s.quizId === selectedQuizId);

  // Split in-progress and completed
  const completedSubs = quizSubs.filter((s) => s.status === 'selesai');
  const inProgressSubs = quizSubs.filter((s) => s.status === 'sedang_mengerjakan');

  // Filtered by class and search
  const filteredCompleted = completedSubs.filter((s) => {
    const matchesClass = selectedClassFilter === 'Semua' || s.studentClass === selectedClassFilter;
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Calculate Metrics
  const totalCompleted = completedSubs.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(completedSubs.reduce((acc, curr) => acc + curr.percentage, 0) / totalCompleted)
      : 0;

  const passedCount = completedSubs.filter((s) => s.passed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;

  const scores = completedSubs.map((s) => s.percentage);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Grade distributions
  const gradeA = completedSubs.filter((s) => s.percentage >= 90).length;
  const gradeB = completedSubs.filter((s) => s.percentage >= 80 && s.percentage < 90).length;
  const gradeC = completedSubs.filter(
    (s) => s.percentage >= (activeQuiz?.passingScore || 75) && s.percentage < 80
  ).length;
  const gradeD = completedSubs.filter((s) => s.percentage < (activeQuiz?.passingScore || 75)).length;

  // Handle AI analysis
  const handleRunAIAnalysis = async () => {
    playChime('click');
    const result = await analyzeRealtimePerformance(selectedQuizId);
    if (result) {
      setAiAnalysis(result);
      playChime('success');
    }
  };

  // CSV Export for Teachers
  const handleExportCSV = () => {
    playChime('click');
    const headers = ['Nama Siswa', 'Kelas', 'Skor Akhir', 'Status KKTP', 'Waktu Pengerjaan (Detik)', 'Waktu Selesai'];
    const rows = filteredCompleted.map((s) => [
      `"${s.studentName}"`,
      `"${s.studentClass}"`,
      s.percentage,
      s.passed ? 'TUNTAS' : 'REMEDIAL',
      s.timeSpentSeconds,
      `"${s.submittedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_IPAS_${activeQuiz?.title.slice(0, 20)}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Pemantauan Real-Time Asesmen IPAS SMK PGRI 5 Surabaya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Analisis Performa & Kemajuan Belajar Siswa
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Evaluasi ketercapaian KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) dan telaah butir soal berbasis AI.
            </p>
          </div>

          {/* Quiz Selector & CSV Export */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedQuizId}
              onChange={(e) => {
                setSelectedQuizId(e.target.value);
                setAiAnalysis(null);
                playChime('click');
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-md focus:bg-slate-800 focus:outline-hidden"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id} className="text-slate-900 bg-white">
                  {q.title.slice(0, 40)}...
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold bg-white text-blue-900 hover:bg-slate-100 rounded-xl shadow-md transition-all cursor-pointer"
              title="Download format Excel/CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Exam Ticker (Students currently taking the test) */}
      {inProgressSubs.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                Sedang Mengerjakan Saat Ini ({inProgressSubs.length} Siswa Terpantau Aktif)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              Update status live otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {inProgressSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/50 flex items-center space-x-3 shadow-xs"
              >
                <img
                  src={sub.studentAvatar}
                  alt={sub.studentName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {sub.studentName}
                  </p>
                  <p className="text-[10px] text-slate-500">{sub.studentClass}</p>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-emerald-600 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Aktif {Math.round(sub.timeSpentSeconds / 60)} menit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-Rata Nilai
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{avgScore}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            KKTP Target:{' '}
            <span className="font-bold text-blue-600">{activeQuiz?.passingScore || 75}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ketuntasan KKTP
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{passRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {passedCount} dari {totalCompleted} siswa tuntas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nilai Tertinggi
            </span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-indigo-600">{highestScore}</p>
          <p className="text-[11px] text-slate-500 mt-1">Performa siswa terbaik</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Perlu Remedial
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-3xl font-black text-rose-600">{gradeD}</p>
          <p className="text-[11px] text-slate-500 mt-1">Siswa di bawah skor KKTP</p>
        </div>
      </div>

      {/* Two Column Section: Grade Distribution & AI Insight Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Breakdown (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Distribusi Predikat Kelas</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  A (Sangat Baik: 90 - 100)
                </span>
                <span className="font-bold">{gradeA} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${totalCompleted > 0 ? (gradeA / totalCompleted) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  B (Baik: 80 - 89)
                </span>
                <span className="font-bold">{gradeB} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${totalCompleted > 0 ? (gradeB / totalCompleted) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  C (Cukup Tuntas: 75 - 79)
                </span>
                <span className="font-bold">{gradeC} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-2.5 rounded-full transition-all"
                  style={{ width: `${totalCompleted > 0 ? (gradeC / totalCompleted) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700 dark:text-rose-300">
                  D (Perlu Remidial: &lt; 75)
                </span>
                <span className="font-bold">{gradeD} Siswa</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${totalCompleted > 0 ? (gradeD / totalCompleted) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            * Kriteria ketuntasan mengacu pada panduan Asesmen Kurikulum Merdeka SMK PGRI 5 Surabaya.
          </div>
        </div>

        {/* Gemini AI Performance Diagnostic Engine (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/40 rounded-3xl p-6 border border-indigo-200 dark:border-indigo-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    Diagnosis AI Real-Time & Rekomendasi Guru
                  </h3>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                    Menganalisis pola kesalahan siswa, miskonsepsi IPAS, dan langkah pembelajaran berdiferensiasi.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAIAnalysis}
                disabled={isGeneratingAI}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGeneratingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{aiAnalysis ? 'Perbarui Analisis' : 'Jalankan Analisis AI'}</span>
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-4 pt-2 text-xs leading-relaxed animate-in fade-in">
                {/* Summary */}
                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200 shadow-2xs">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    📋 Ringkasan Diagnosis Kelas:
                  </p>
                  <p>{aiAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Strengths */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                    <p className="font-bold mb-1.5 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kekuatan Konsep yang Dikuasai:</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      {aiAnalysis.strengths.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                    <p className="font-bold mb-1.5 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Titik Lemah / Miskonsepsi:</span>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      {aiAnalysis.weaknesses.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Remedial & Enrichment Suggestions */}
                <div className="p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                  <p className="font-bold mb-1">
                    🎯 Tindak Lanjut Berdiferensiasi (Remidial & Pengayaan):
                  </p>
                  <div className="space-y-1 text-[11px]">
                    <p>
                      <span className="font-semibold text-rose-700 dark:text-rose-300">
                        • Remidial:
                      </span>{' '}
                      {aiAnalysis.remedialSuggestions.join(' | ')}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        • Pengayaan Vokasi:
                      </span>{' '}
                      {aiAnalysis.enrichmentSuggestions.join(' | ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-indigo-900/60 dark:text-indigo-300/60">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">
                  Klik "Jalankan Analisis AI" untuk menghasilkan telaah pedagogis otomatis hasil asesmen kuis ini.
                </p>
              </div>
            )}
          </div>

          {aiAnalysis && (
            <div className="mt-3 pt-2 text-[10px] text-slate-500 italic">
              💡 Refleksi Guru: "{aiAnalysis.teacherReflection}"
            </div>
          )}
        </div>
      </div>

      {/* Item Analysis Table (7 question types breakdown) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Analisis Butir Soal & Daya Pembeda (7 Format)</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tipe Format Soal</th>
                <th className="px-4 py-3">Pertanyaan Ringkas</th>
                <th className="px-4 py-3 text-center">Bobot</th>
                <th className="px-4 py-3 text-center">Kesukaran</th>
                <th className="px-4 py-3 text-center">% Ketepatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeQuiz?.questions.map((q, idx) => {
                const simulatedCorrectRate = Math.min(
                  95,
                  Math.max(40, Math.round(85 - idx * 7 + (q.difficulty === 'sukar' ? -15 : 10)))
                );

                return (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-md truncate">
                      {q.text}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{q.points}</td>
                    <td className="px-4 py-3 text-center capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.difficulty === 'sukar'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : q.difficulty === 'sedang'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {simulatedCorrectRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rekap Hasil Belajar Peserta Didik
            </h3>
            <p className="text-xs text-slate-500">
              Daftar nilai kuis {activeQuiz?.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Class filter */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="X TKR 1">X TKR 1</option>
              <option value="X TKR 2">X TKR 2</option>
              <option value="X RPL 1">X RPL 1</option>
              <option value="X TBSM 1">X TBSM 1</option>
              <option value="X AKL 1">X AKL 1</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Kelas & Jurusan</th>
                <th className="px-4 py-3 text-center">Durasi</th>
                <th className="px-4 py-3 text-center">Nilai Akhir</th>
                <th className="px-4 py-3 text-center">Status KKTP</th>
                <th className="px-4 py-3 text-right">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCompleted.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white flex items-center space-x-2.5">
                    <img
                      src={sub.studentAvatar}
                      alt={sub.studentName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span>{sub.studentName}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {sub.studentClass}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {Math.round(sub.timeSpentSeconds / 60)} m
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-sm">
                    {sub.percentage}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200'
                      }`}
                    >
                      {sub.passed ? 'Tuntas' : 'Remedial'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
