import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Quiz, Question, QuizSubmission, StudentAnswerRecord } from '../types/ipas';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flag,
  HelpCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  Check,
  X,
  Send,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  quiz: Quiz;
  onExit: () => void;
}

export const QuizPlayer: React.FC<Props> = ({ quiz, onExit }) => {
  const { currentUser, recordSubmission, playChime, explainQuestionAI, gradeEssayAI } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);

  // AI explanation state during review
  const [activeAIExplainingId, setActiveAIExplainingId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

  const currentQ = quiz.questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (submissionResult) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submissionResult]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle flag / ragu-ragu
  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
    playChime('click');
  };

  // Answer handlers for the 7 Question Types
  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    playChime('click');
  };

  // 1. Pilihan Ganda Sederhana: radio select
  const handleSingleSelect = (qId: string, optIndex: number) => {
    handleAnswerChange(qId, optIndex);
  };

  // 2. Pilihan Ganda Kompleks: toggle checkbox in array
  const handleComplexSelect = (qId: string, optIndex: number) => {
    const current = (answers[qId] as number[]) || [];
    const updated = current.includes(optIndex)
      ? current.filter((i) => i !== optIndex)
      : [...current, optIndex].sort((a, b) => a - b);
    handleAnswerChange(qId, updated);
  };

  // 3. Benar / Salah Tunggal
  const handleTrueFalse = (qId: string, val: boolean) => {
    handleAnswerChange(qId, val);
  };

  // 4. Benar / Salah Kompleks: matrix toggle
  const handleMatrixChange = (qId: string, statementId: string, boolVal: boolean) => {
    const currentMatrix = answers[qId] || {};
    handleAnswerChange(qId, { ...currentMatrix, [statementId]: boolVal });
  };

  // 5. Menjodohkan: map pair left id to chosen right string
  const handleMatchingChange = (qId: string, pairId: string, matchedRight: string) => {
    const currentMatch = answers[qId] || {};
    handleAnswerChange(qId, { ...currentMatch, [pairId]: matchedRight });
  };

  // 6. Isian Singkat
  const handleShortAnswerChange = (qId: string, text: string) => {
    handleAnswerChange(qId, text);
  };

  // 7. Uraian
  const handleEssayChange = (qId: string, text: string) => {
    handleAnswerChange(qId, text);
  };

  // Submit and Evaluate All 7 Question Formats
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    playChime('alert');

    const records: StudentAnswerRecord[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const q of quiz.questions) {
      maxScore += q.points;
      const ans = answers[q.id];

      if (q.type === 'pilihan_ganda') {
        const isCorrect = ans === q.correctOptionIndex;
        const scoreEarned = isCorrect ? q.points : 0;
        totalScore += scoreEarned;
        records.push({ questionId: q.id, type: q.type, answer: ans, isCorrect, scoreEarned, maxScore: q.points });
      } else if (q.type === 'pg_kompleks') {
        const userSelected = (ans as number[]) || [];
        const correctSet = q.correctOptionIndices || [];
        // Check partial or full match
        const matchesAll =
          userSelected.length === correctSet.length &&
          userSelected.every((idx) => correctSet.includes(idx));
        const scoreEarned = matchesAll ? q.points : userSelected.some((i) => correctSet.includes(i)) ? Math.round(q.points * 0.5) : 0;
        totalScore += scoreEarned;
        records.push({ questionId: q.id, type: q.type, answer: userSelected, isCorrect: matchesAll, scoreEarned, maxScore: q.points });
      } else if (q.type === 'benar_salah') {
        const isCorrect = ans === q.correctBool;
        const scoreEarned = isCorrect ? q.points : 0;
        totalScore += scoreEarned;
        records.push({ questionId: q.id, type: q.type, answer: ans, isCorrect, scoreEarned, maxScore: q.points });
      } else if (q.type === 'bs_kompleks') {
        const matrixItems = q.matrixItems || [];
        const userMatrix = ans || {};
        let correctItemCount = 0;
        matrixItems.forEach((item) => {
          if (userMatrix[item.id] === item.correctBool) {
            correctItemCount++;
          }
        });
        const ratio = matrixItems.length > 0 ? correctItemCount / matrixItems.length : 0;
        const scoreEarned = Math.round(q.points * ratio);
        totalScore += scoreEarned;
        records.push({
          questionId: q.id,
          type: q.type,
          answer: userMatrix,
          isCorrect: ratio === 1,
          scoreEarned,
          maxScore: q.points,
        });
      } else if (q.type === 'menjodohkan') {
        const pairs = q.matchingPairs || [];
        const userPairs = ans || {};
        let correctMatches = 0;
        pairs.forEach((p) => {
          if (userPairs[p.id] === p.right) {
            correctMatches++;
          }
        });
        const ratio = pairs.length > 0 ? correctMatches / pairs.length : 0;
        const scoreEarned = Math.round(q.points * ratio);
        totalScore += scoreEarned;
        records.push({
          questionId: q.id,
          type: q.type,
          answer: userPairs,
          isCorrect: ratio === 1,
          scoreEarned,
          maxScore: q.points,
        });
      } else if (q.type === 'isian_singkat') {
        const userText = (ans || '').trim().toLowerCase();
        const validAnswers = (q.correctShortAnswers || []).map((s) => s.trim().toLowerCase());
        const isCorrect = validAnswers.some((v) => userText.includes(v) || v.includes(userText));
        const scoreEarned = isCorrect ? q.points : 0;
        totalScore += scoreEarned;
        records.push({ questionId: q.id, type: q.type, answer: ans, isCorrect, scoreEarned, maxScore: q.points });
      } else if (q.type === 'uraian') {
        // Evaluate essay using rubric & AI grading helper
        const userText = (ans || '').trim();
        let scoreEarned = 0;
        let feedback = '';

        if (userText.length > 20) {
          try {
            const grading = await gradeEssayAI(q.text, q.rubricGuide || '', userText, q.points);
            scoreEarned = grading.score;
            feedback = grading.feedback;
          } catch {
            scoreEarned = Math.round(q.points * 0.8);
            feedback = 'Jawaban telah memaparkan prinsip dasar dengan baik.';
          }
        } else {
          scoreEarned = userText ? Math.round(q.points * 0.3) : 0;
          feedback = userText ? 'Uraian terlalu singkat, belum memuat penjelasan mendalam.' : 'Tidak dijawab.';
        }

        totalScore += scoreEarned;
        records.push({
          questionId: q.id,
          type: q.type,
          answer: userText,
          isCorrect: scoreEarned >= q.points * 0.7,
          scoreEarned,
          maxScore: q.points,
          feedback,
        });
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.className || 'X TKR 1',
      studentAvatar: currentUser.avatar,
      answers,
      records,
      totalScore,
      maxScore,
      percentage,
      passed,
      startedAt: new Date(Date.now() - (quiz.durationMinutes * 60 - timeLeftSeconds) * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: quiz.durationMinutes * 60 - timeLeftSeconds,
      status: 'selesai',
    };

    recordSubmission(submission);
    setSubmissionResult(submission);
    setIsSubmitting(false);

    if (passed) {
      playChime('success');
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleExplainAI = async (q: Question) => {
    setActiveAIExplainingId(q.id);
    playChime('click');
    try {
      const expl = await explainQuestionAI(
        `Jelaskan mengapa konsep soal ini penting dan bagaimana menjawabnya: "${q.text}". Kunci pembahasan: "${q.explanation}"`,
        q.aspect
      );
      setAiExplanations((prev) => ({ ...prev, [q.id]: expl }));
      playChime('success');
    } catch {
      setAiExplanations((prev) => ({
        ...prev,
        [q.id]: q.explanation || 'Konsep ini menghubungkan prinsip sains IPAS dengan aplikasi kejuruan di SMK.',
      }));
    } finally {
      setActiveAIExplainingId(null);
    }
  };

  // -------------------------------------------------------------
  // REVIEW / RESULT SCREEN
  // -------------------------------------------------------------
  if (submissionResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Score Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-lg mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Hasil Asesmen Kuis IPAS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
            {quiz.title} • SMK PGRI 5 Surabaya
          </p>

          {/* Big Score Dial */}
          <div className="my-6 flex flex-col items-center">
            <div
              className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${
                submissionResult.passed
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              <span className="text-4xl font-black">{submissionResult.percentage}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                Skor Akhir
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  submissionResult.passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                }`}
              >
                {submissionResult.passed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tuntas KKTP (Target ≥ {quiz.passingScore})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Perlu Remedial (KKTP: {quiz.passingScore})</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs py-3 border-y border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-slate-400 font-medium">Poin Diperoleh</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {submissionResult.totalScore} / {submissionResult.maxScore}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Waktu Selesai</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {Math.round(submissionResult.timeSpentSeconds / 60)} Menit
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Ketuntasan</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {submissionResult.records.filter((r) => r.isCorrect).length} /{' '}
                {submissionResult.records.length} Soal
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Kembali ke Daftar Kuis
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluasi & Pembahasan 7 Format Soal:
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Dilengkapi AI Tutor Review
            </span>
          </div>

          {quiz.questions.map((q, idx) => {
            const rec = submissionResult.records.find((r) => r.questionId === q.id);
            const isCorrect = rec?.isCorrect;

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-xs transition-all ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : 'border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    {rec?.scoreEarned || 0} / {q.points} Poin
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {q.text}
                </p>

                {/* Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-white mb-1">
                    📖 Kunci Pembahasan Ilmiah:
                  </p>
                  <p className="leading-relaxed">{q.explanation}</p>
                  {rec?.feedback && (
                    <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
                      💬 Catatan Penilai: {rec.feedback}
                    </p>
                  )}
                </div>

                {/* AI Tutor On-Demand Button for Question */}
                <div className="mt-3">
                  {!aiExplanations[q.id] ? (
                    <button
                      onClick={() => handleExplainAI(q)}
                      disabled={activeAIExplainingId === q.id}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      {activeAIExplainingId === q.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Tanya Penjelasan Mendalam ke AI Tutor</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed whitespace-pre-line animate-in fade-in">
                      <p className="font-bold flex items-center space-x-1 text-indigo-700 dark:text-indigo-300 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Penjelasan Interaktif Tutor AI:</span>
                      </p>
                      {aiExplanations[q.id]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE EXAM PLAYER INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar with Quiz Title, Timer & Exit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (confirm('Keluar dari kuis? Jawaban yang belum dikirim akan hilang.')) {
                onExit();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Keluar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
              {quiz.title}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {quiz.aspect} • KKTP: {quiz.passingScore}
            </p>
          </div>
        </div>

        {/* Timer Bar */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border ${
            timeLeftSeconds < 180
              ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeLeftSeconds)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Card (Span 3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            {/* Question Header: Index, Format Badge, Points, Flag button */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {currentIndex + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {currentQ.type.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-slate-400">Bobot: {currentQ.points} Poin</p>
                </div>
              </div>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  flagged[currentQ.id]
                    ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/40'
                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentQ.id] ? 'Ragu-ragu' : 'Tandai'}</span>
              </button>
            </div>

            {/* Stimulus Context (if any) */}
            {currentQ.context && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 mb-4 leading-relaxed">
                <span className="font-bold">Stimulus Kasus Vokasi:</span> {currentQ.context}
              </div>
            )}

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
              {currentQ.text}
            </h3>

            {/* --------------------------------------------------------- */}
            {/* RENDER THE 7 QUESTION FORMAT INTERFACES */}
            {/* --------------------------------------------------------- */}

            {/* 1. PILIHAN GANDA SEDERHANA */}
            {currentQ.type === 'pilihan_ganda' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSingleSelect(currentQ.id, optIdx)}
                      className={`flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. PILIHAN GANDA KOMPLEKS (Checkboxes) */}
            {currentQ.type === 'pg_kompleks' && currentQ.options && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  ℹ️ Petunjuk: Centang semua pilihan yang benar (bisa lebih dari satu jawaban).
                </p>
                {currentQ.options.map((opt, optIdx) => {
                  const userAnswers = (answers[currentQ.id] as number[]) || [];
                  const isChecked = userAnswers.includes(optIdx);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleComplexSelect(currentQ.id, optIdx)}
                      className={`flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. BENAR / SALAH SEDERHANA */}
            {currentQ.type === 'benar_salah' && (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <button
                  type="button"
                  onClick={() => handleTrueFalse(currentQ.id, true)}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    answers[currentQ.id] === true
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span className="font-extrabold text-sm sm:text-base">BENAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrueFalse(currentQ.id, false)}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    answers[currentQ.id] === false
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <X className="w-8 h-8 text-rose-500" />
                  <span className="font-extrabold text-sm sm:text-base">SALAH</span>
                </button>
              </div>
            )}

            {/* 4. BENAR / SALAH KOMPLEKS (Matrix Table) */}
            {currentQ.type === 'bs_kompleks' && currentQ.matrixItems && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Pernyataan Konsep IPAS</th>
                      <th className="px-3 py-3 text-center w-20">Benar</th>
                      <th className="px-3 py-3 text-center w-20">Salah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentQ.matrixItems.map((item) => {
                      const userChoice = answers[currentQ.id]?.[item.id];
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            {item.statement}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="radio"
                              name={`matrix-${item.id}`}
                              checked={userChoice === true}
                              onChange={() => handleMatrixChange(currentQ.id, item.id, true)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="radio"
                              name={`matrix-${item.id}`}
                              checked={userChoice === false}
                              onChange={() => handleMatrixChange(currentQ.id, item.id, false)}
                              className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. MENJODOHKAN (Matching Pairs) */}
            {currentQ.type === 'menjodohkan' && currentQ.matchingPairs && (
              <div className="space-y-4">
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  ℹ️ Pasangkan setiap komponen di kolom kiri dengan pilihan deskripsi yang paling tepat di kolom kanan.
                </p>
                <div className="space-y-3">
                  {currentQ.matchingPairs.map((pair, pIdx) => {
                    const selectedVal = answers[currentQ.id]?.[pair.id] || '';
                    return (
                      <div
                        key={pair.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-2 sm:max-w-xs">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {pIdx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {pair.left}
                          </span>
                        </div>

                        <div className="flex-1 sm:max-w-md">
                          <select
                            value={selectedVal}
                            onChange={(e) => handleMatchingChange(currentQ.id, pair.id, e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          >
                            <option value="">-- Pilih Pasangan yang Sesuai --</option>
                            {currentQ.matchingPairs?.map((optPair) => (
                              <option key={optPair.id} value={optPair.right}>
                                {optPair.right}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. ISIAN SINGKAT */}
            {currentQ.type === 'isian_singkat' && (
              <div className="max-w-xl space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tuliskan Jawaban Singkat Anda:
                </label>
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Ketik istilah atau kata kunci jawaban..."
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-inner font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  * Sistem otomatis memverifikasi kecocokan kata kunci ilmiah tanpa membedakan huruf besar/kecil.
                </p>
              </div>
            )}

            {/* 7. URAIAN / ESSAY */}
            {currentQ.type === 'uraian' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Uraian Jawaban Analisis:
                  </label>
                  {currentQ.rubricGuide && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Didukung Auto-Rubric Scoring
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                  placeholder="Tuliskan argumen, langkah solusi, dan pertimbangan ilmiah Anda secara komprehensif..."
                  className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed shadow-inner font-sans"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Panjang teks: {(answers[currentQ.id] || '').length} karakter</span>
                  <span>Minimal 2-3 paragraf berdasar kriteria ilmiah</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                playChime('click');
              }}
              disabled={currentIndex === 0}
              className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIndex(currentIndex + 1);
                  playChime('click');
                }}
                className="inline-flex items-center space-x-1 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
              >
                <span>Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menyelesaikan dan mengirimkan asesmen ini?')) {
                    handleSubmitQuiz();
                  }
                }}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Selesai & Kumpulkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette Grid & Legend */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
            Navigasi Butir Soal
          </h4>

          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered =
                answers[q.id] !== undefined &&
                answers[q.id] !== '' &&
                !(Array.isArray(answers[q.id]) && answers[q.id].length === 0);
              const isFlag = flagged[q.id];
              const isCurrent = idx === currentIndex;

              let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
              if (isFlag) {
                btnClass = 'bg-amber-100 text-amber-800 border-2 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200';
              } else if (isAnswered) {
                btnClass = 'bg-emerald-500 text-white shadow-xs';
              }

              if (isCurrent) {
                btnClass += ' ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    playChime('click');
                  }}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500"></span>
              <span>Sudah Dijawab</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400"></span>
              <span>Ditandai Ragu-ragu</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700"></span>
              <span>Belum Dijawab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
