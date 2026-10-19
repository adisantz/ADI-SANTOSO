import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModuleItem, IPASAspect } from '../types/ipas';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Briefcase,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  X,
  CheckCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { ModuleEditorModal } from './ModuleEditorModal';

const ASPECTS: (IPASAspect | 'Semua')[] = [
  'Semua',
  'Zat dan Perubahannya',
  'Energi dan Perubahannya',
  'Makhluk Hidup dan Lingkungannya',
  'Bumi dan Antariksa',
  'Interaksi dan Dinamika Sosial',
  'Keruangan dan Konektivitas',
  'Perilaku Ekonomi dan Kesejahteraan',
];

export const ModuleList: React.FC = () => {
  const { modules, currentUser, deleteModule, playChime } = useApp();

  const [selectedAspect, setSelectedAspect] = useState<IPASAspect | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReadingModule, setActiveReadingModule] = useState<ModuleItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);

  // Text to speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Tutor Q&A Drawer for active module
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState('');
  const [isQueryingAI, setIsQueryingAI] = useState(false);

  // Filter modules
  const filteredModules = modules.filter((m) => {
    const matchesAspect = selectedAspect === 'Semua' || m.aspect === selectedAspect;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.keyConcepts.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAspect && matchesSearch;
  });

  const handleSpeechToggle = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/###/g, '').replace(/\$\$/g, ''));
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleAskAITutor = async () => {
    if (!tutorQuery.trim() || !activeReadingModule) return;
    setIsQueryingAI(true);
    playChime('click');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeReadingModule.aspect,
          query: `Pada modul "${activeReadingModule.title}": ${tutorQuery}`,
          studentLevel: 'Siswa SMK PGRI 5 Surabaya',
        }),
      });
      const data = await res.json();
      setTutorAnswer(data.explanation || 'Penjelasan telah dirangkum berdasarkan prinsip sains kontekstual.');
      playChime('success');
    } catch {
      setTutorAnswer(
        'AI Tutor: Konsep ini sangat relevan dengan praktik kejuruan Anda. Perhatikan bagaimana interaksi zat atau energi bekerja langsung di lingkungan bengkel dan ekosistem kota Surabaya.'
      );
    } finally {
      setIsQueryingAI(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kurikulum Merdeka IPAS SMK PGRI 5 Surabaya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Modul & Materi Pembelajaran IPAS Terpadu
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Eksplorasi integrasi sains alam, dinamika sosial, isu lingkungan pesisir Surabaya, serta relevansinya dengan kompetensi keahlian bengkel dan industri vokasi.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs font-medium">
              📚 {modules.length} Modul Interaktif
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs font-medium">
              🔬 7 Aspek Kompetensi
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs font-medium">
              🤖 Didukung Asisten AI Gemini
            </span>
          </div>
        </div>

        {currentUser.role === 'guru' && (
          <div className="mt-5 sm:mt-0 sm:absolute sm:right-8 sm:bottom-8 z-20">
            <button
              onClick={() => {
                setEditingModule(null);
                setIsEditorOpen(true);
                playChime('click');
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Modul Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi, konsep korosi, energi, limbah..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
        </div>

        {/* Aspect Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {ASPECTS.map((aspect) => (
            <button
              key={aspect}
              onClick={() => {
                setSelectedAspect(aspect);
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                selectedAspect === aspect
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {aspect}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                  Bab {item.chapterNumber} • {item.aspect}
                </span>

                {currentUser.role === 'guru' && (
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingModule(item);
                        setIsEditorOpen(true);
                      }}
                      title="Edit Modul"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus modul "${item.title}"?`)) {
                          deleteModule(item.id);
                        }
                      }}
                      title="Hapus Modul"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Summary */}
              <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>

              {/* Vocational Connection */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start space-x-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{item.vocationalConnection}</span>
              </div>

              {/* Key Concept Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.keyConcepts.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.readTimeMinutes} menit baca</span>
              </div>

              <button
                onClick={() => {
                  setActiveReadingModule(item);
                  playChime('click');
                }}
                className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Pelajari Modul</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada modul yang cocok
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Coba ubah kata kunci pencarian atau pilih aspek IPAS lainnya.
          </p>
        </div>
      )}

      {/* Module Reader Modal */}
      {activeReadingModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200">
                  Bab {activeReadingModule.chapterNumber}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeReadingModule.aspect}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Speech Synthesis Audio Button */}
                <button
                  onClick={() =>
                    handleSpeechToggle(
                      activeReadingModule.title + '. ' + activeReadingModule.content
                    )
                  }
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSpeaking
                      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                  title="Bacakan materi bersuara"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Hentikan Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dengarkan Materi</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (isSpeaking) window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    setActiveReadingModule(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Reader Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {activeReadingModule.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Penyusun: {activeReadingModule.author}</span>
                  <span>•</span>
                  <span>SMK PGRI 5 Surabaya</span>
                  <span>•</span>
                  <span>Target: {activeReadingModule.targetClasses.join(', ')}</span>
                </div>
              </div>

              {/* Vocational banner */}
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                <p className="font-bold mb-1 flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Koneksi Dunia Kerja & Industri (DUDI):</span>
                </p>
                <p className="leading-relaxed">{activeReadingModule.vocationalConnection}</p>
              </div>

              {/* Markdown Content Styled */}
              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {activeReadingModule.content}
              </div>

              {/* Key Concepts */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Konsep Kunci yang Dipelajari:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeReadingModule.keyConcepts.map((kc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>{kc}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Interactive Tutor Assistance Drawer inside Module */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Tanya Tutor AI IPAS Terkait Modul Ini
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                  Punya pertanyaan tentang rumus, contoh bengkel, atau fenomena Surabaya di bab ini? AI siap menjelaskan secara interaktif.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAITutor()}
                    placeholder="Misal: Jelaskan proses galvanisasi seng pada sasis mobil..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleAskAITutor}
                    disabled={isQueryingAI || !tutorQuery.trim()}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isQueryingAI ? 'Menganalisis...' : 'Tanyakan'}
                  </button>
                </div>

                {tutorAnswer && (
                  <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line animate-in fade-in">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      💡 Jawaban Tutor AI IPAS:
                    </p>
                    {tutorAnswer}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Kurikulum Merdeka • Projek IPAS SMK PGRI 5 Surabaya
              </span>
              <button
                onClick={() => {
                  if (isSpeaking) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setActiveReadingModule(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl"
              >
                Tutup Modul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal for Guru */}
      <ModuleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingModule(null);
        }}
        editItem={editingModule}
      />
    </div>
  );
};
