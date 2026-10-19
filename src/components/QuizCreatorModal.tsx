import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Quiz, Question, QuestionType, IPASAspect } from '../types/ipas';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  FileQuestion,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editQuiz?: Quiz | null;
}

const ASPECTS: IPASAspect[] = [
  'Makhluk Hidup dan Lingkungannya',
  'Zat dan Perubahannya',
  'Energi dan Perubahannya',
  'Bumi dan Antariksa',
  'Keruangan dan Konektivitas',
  'Interaksi dan Dinamika Sosial',
  'Perilaku Ekonomi dan Kesejahteraan',
];

const QUESTION_TYPES: { type: QuestionType; label: string; desc: string }[] = [
  { type: 'pilihan_ganda', label: '1. Pilihan Ganda Sederhana', desc: '1 jawaban benar dari pilihan opsi' },
  { type: 'pg_kompleks', label: '2. Pilihan Ganda Kompleks', desc: 'Dua atau lebih jawaban benar (centang)' },
  { type: 'benar_salah', label: '3. Benar / Salah Sederhana', desc: 'Satu pernyataan tunggal Benar atau Salah' },
  { type: 'bs_kompleks', label: '4. Benar / Salah Kompleks', desc: 'Tabel matriks pernyataan dengan pilihan B/S' },
  { type: 'menjodohkan', label: '5. Menjodohkan (Matching)', desc: 'Pasangan premis kiri dengan respon kanan' },
  { type: 'isian_singkat', label: '6. Isian Singkat', desc: 'Jawaban kata kunci atau angka pasti' },
  { type: 'uraian', label: '7. Uraian / Essay Analisis', desc: 'Pertanyaan HOTS dengan pedoman rubrik' },
];

export const QuizCreatorModal: React.FC<Props> = ({ isOpen, onClose, editQuiz }) => {
  const { addQuiz, updateQuiz, generateAIQuiz, playChime } = useApp();

  const [title, setTitle] = useState(editQuiz?.title || '');
  const [aspect, setAspect] = useState<IPASAspect>(editQuiz?.aspect || 'Zat dan Perubahannya');
  const [description, setDescription] = useState(editQuiz?.description || '');
  const [targetClasses, setTargetClasses] = useState(
    editQuiz?.targetClasses?.join(', ') || 'X TKR 1, X RPL 1, X TBSM 1, X AKL 1'
  );
  const [durationMinutes, setDurationMinutes] = useState(editQuiz?.durationMinutes || 25);
  const [passingScore, setPassingScore] = useState(editQuiz?.passingScore || 75);
  const [questions, setQuestions] = useState<Question[]>(editQuiz?.questions || []);

  // AI Generator Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiSelectedTypes, setAiSelectedTypes] = useState<QuestionType[]>([
    'pilihan_ganda',
    'pg_kompleks',
    'benar_salah',
    'bs_kompleks',
    'menjodohkan',
    'isian_singkat',
    'uraian',
  ]);
  const [aiCount, setAiCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Question Add Form
  const [newQType, setNewQType] = useState<QuestionType>('pilihan_ganda');

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    playChime('click');
    try {
      const generated = await generateAIQuiz(aiTopic, aiSelectedTypes, aiCount);
      setQuestions((prev) => [...prev, ...generated]);
      playChime('success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualQuestion = (type: QuestionType) => {
    playChime('click');
    let newQ: Question = {
      id: `manual-q-${Date.now()}`,
      type,
      text: 'Tuliskan pertanyaan IPAS di sini...',
      points: 15,
      aspect,
      difficulty: 'sedang',
      explanation: 'Penjelasan konsep ilmiah jawaban.',
    };

    if (type === 'pilihan_ganda') {
      newQ.options = ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'];
      newQ.correctOptionIndex = 0;
    } else if (type === 'pg_kompleks') {
      newQ.options = ['Opsi 1 (Benar)', 'Opsi 2 (Salah)', 'Opsi 3 (Benar)', 'Opsi 4 (Salah)'];
      newQ.correctOptionIndices = [0, 2];
    } else if (type === 'benar_salah') {
      newQ.correctBool = true;
    } else if (type === 'bs_kompleks') {
      newQ.matrixItems = [
        { id: 'm1', statement: 'Pernyataan Konsep 1', correctBool: true },
        { id: 'm2', statement: 'Pernyataan Konsep 2', correctBool: false },
      ];
    } else if (type === 'menjodohkan') {
      newQ.matchingPairs = [
        { id: 'p1', left: 'Istilah A', right: 'Deskripsi A' },
        { id: 'p2', left: 'Istilah B', right: 'Deskripsi B' },
      ];
    } else if (type === 'isian_singkat') {
      newQ.correctShortAnswers = ['jawaban baku', 'alternatif'];
    } else if (type === 'uraian') {
      newQ.rubricGuide = 'Kriteria: (1) Konsep sains tepat, (2) Contoh nyata industri, (3) Analisis logis.';
    }

    setQuestions((prev) => [...prev, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    playChime('alert');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) {
      alert('Harap isi judul kuis dan tambahkan minimal 1 butir soal!');
      return;
    }

    const payload = {
      title,
      aspect,
      description: description || `Kuis asesmen IPAS untuk ${title}`,
      targetClasses: targetClasses.split(',').map((c) => c.trim()).filter(Boolean),
      durationMinutes: Number(durationMinutes) || 20,
      passingScore: Number(passingScore) || 75,
      questions,
      isPublished: true,
    };

    if (editQuiz) {
      updateQuiz(editQuiz.id, payload);
    } else {
      addQuiz(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editQuiz ? 'Edit Kuis & Asesmen IPAS' : 'Buat Kuis Baru (7 Tipe Format Soal)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lengkap dengan Pilihan Ganda, PG Kompleks, B/S, Menjodohkan, Isian, Uraian & AI Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Asesmen / Kuis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Asesmen Formatif 2: Energi Terbarukan & Efisiensi Vokasi"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Elemen Aspek IPAS
                </label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as IPASAspect)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {ASPECTS.map((asp) => (
                    <option key={asp} value={asp}>
                      {asp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Durasi Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai KKTP / KKM (Target)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sasaran Kelas (Pisahkan koma)
              </label>
              <input
                type="text"
                value={targetClasses}
                onChange={(e) => setTargetClasses(e.target.value)}
                placeholder="X TKR 1, X RPL 1, X TBSM 1"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: AI Question Generator Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                Generator Soal Cerdas Gemini AI
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                7 Tipe Otomatis
              </span>
            </div>
            <p className="text-xs text-indigo-950 dark:text-indigo-300">
              Buat paket butir soal berkualitas tinggi otomatis dengan stimulus kontekstual Surabaya dan relevansi vokasi SMK.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Masukkan topik, misal: Korosi Logam Maritim Surabaya atau Transisi Kendaraan Listrik EV"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="flex items-center space-x-2">
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="px-3 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value={2}>2 Soal</option>
                  <option value={3}>3 Soal</option>
                  <option value={5}>5 Soal</option>
                  <option value={7}>7 Soal (1 Per Tipe)</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !aiTopic.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isGenerating ? 'Menghasilkan...' : 'Generate AI'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Manual Add Quick Buttons for the 7 Question Types */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tambah Butir Soal Manual Berdasarkan Format:
              </label>
              <span className="text-[11px] text-slate-400">Total Soal: {questions.length} butir</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUESTION_TYPES.map((qt) => (
                <button
                  key={qt.type}
                  type="button"
                  onClick={() => handleAddManualQuestion(qt.type)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 text-left transition-all group cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 line-clamp-1">
                    {qt.label}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{qt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Current Question List inside Quiz */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Daftar Soal Dalam Kuis Ini:
            </h4>

            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={q.points}
                      onChange={(e) => {
                        const newPts = Number(e.target.value);
                        setQuestions((prev) =>
                          prev.map((item) => (item.id === q.id ? { ...item, points: newPts } : item))
                        );
                      }}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold"
                      title="Bobot Poin"
                    />
                    <span className="text-[11px] text-slate-400">Poin</span>

                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={q.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setQuestions((prev) =>
                        prev.map((item) => (item.id === q.id ? { ...item, text: newText } : item))
                      );
                    }}
                    placeholder="Pertanyaan soal..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Sub info for specific question types */}
                {q.type === 'pilihan_ganda' && q.options && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctOptionIndex === oIdx}
                          onChange={() => {
                            setQuestions((prev) =>
                              prev.map((item) =>
                                item.id === q.id ? { ...item, correctOptionIndex: oIdx } : item
                              )
                            );
                          }}
                        />
                        <span className="truncate text-slate-600 dark:text-slate-300">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'menjodohkan' && q.matchingPairs && (
                  <div className="text-[11px] text-slate-500">
                    🔗 {q.matchingPairs.length} pasangan terdefinisi untuk pencocokan.
                  </div>
                )}

                {q.type === 'uraian' && (
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                    📝 Rubrik: {q.rubricGuide || 'Kriteria HOTS & relevansi kejuruan'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total Bobot: {questions.reduce((acc, curr) => acc + curr.points, 0)} Poin
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center space-x-1.5 px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editQuiz ? 'Simpan Perubahan' : 'Terbitkan Kuis'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
