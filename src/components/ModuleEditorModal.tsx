import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModuleItem, IPASAspect } from '../types/ipas';
import { X, Sparkles, BookOpen, Layers, Check, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ModuleItem | null;
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

export const ModuleEditorModal: React.FC<Props> = ({ isOpen, onClose, editItem }) => {
  const { addModule, updateModule, currentUser, playChime } = useApp();

  const [title, setTitle] = useState(editItem?.title || '');
  const [aspect, setAspect] = useState<IPASAspect>(editItem?.aspect || 'Zat dan Perubahannya');
  const [chapterNumber, setChapterNumber] = useState(editItem?.chapterNumber || 1);
  const [targetClasses, setTargetClasses] = useState(editItem?.targetClasses?.join(', ') || 'X TKR 1, X RPL 1, X TBSM 1, X AKL 1');
  const [readTimeMinutes, setReadTimeMinutes] = useState(editItem?.readTimeMinutes || 15);
  const [summary, setSummary] = useState(editItem?.summary || '');
  const [content, setContent] = useState(editItem?.content || '');
  const [vocationalConnection, setVocationalConnection] = useState(
    editItem?.vocationalConnection || 'Menghubungkan konsep IPAS kejuruan dengan standar operasional di industri mitra SMK PGRI 5 Surabaya.'
  );
  const [keyConcepts, setKeyConcepts] = useState(editItem?.keyConcepts?.join(', ') || '');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!content && !title) return;
    setIsGeneratingSummary(true);
    playChime('click');
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aspect,
          query: `Buatkan ringkasan 2 paragraf padat dan 4 poin konsep kunci untuk modul IPAS SMK PGRI 5 Surabaya berjudul "${title}". Konten awal: ${content.slice(0, 300)}`,
        }),
      });
      const data = await response.json();
      if (data.explanation) {
        setSummary(data.explanation);
        playChime('success');
      }
    } catch {
      setSummary(`Modul ${title} membedah konsep ${aspect} dengan penekanan pada penerapan praktis di lingkungan sekolah kejuruan dan industri kota Surabaya.`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title,
      aspect,
      chapterNumber: Number(chapterNumber) || 1,
      targetClasses: targetClasses.split(',').map((c) => c.trim()).filter(Boolean),
      readTimeMinutes: Number(readTimeMinutes) || 10,
      summary: summary || title,
      content,
      keyConcepts: keyConcepts ? keyConcepts.split(',').map((k) => k.trim()).filter(Boolean) : [aspect, 'Prinsip IPAS', 'Aplikasi Vokasi'],
      vocationalConnection,
      author: currentUser.name,
    };

    if (editItem) {
      updateModule(editItem.id, payload);
    } else {
      addModule(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editItem ? 'Edit Modul IPAS' : 'Upload Modul / Materi Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lengkapi modul pembelajaran untuk siswa SMK PGRI 5 Surabaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Modul / Materi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Zat dan Perubahannya: Pengelolaan Limbah B3 Bengkel Otomotif"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                Bab Ke-
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estimasi Baca (Menit)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sasaran Kelas / Jurusan (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={targetClasses}
              onChange={(e) => setTargetClasses(e.target.value)}
              placeholder="X TKR 1, X RPL 1, X TBSM 1, X AKL 1"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Rangkuman Singkat Modul
              </label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !title}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isGeneratingSummary ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>AI Generate Ringkasan</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Deskripsi singkat isi modul dan target kompetensi siswa..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Koneksi Vokasi & Dunia Kerja SMK
            </label>
            <input
              type="text"
              value={vocationalConnection}
              onChange={(e) => setVocationalConnection(e.target.value)}
              placeholder="Kaitan langsung materi ini dengan keahlian bengkel atau profesi siswa..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kata Kunci / Konsep Utama (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={keyConcepts}
              onChange={(e) => setKeyConcepts(e.target.value)}
              placeholder="Unsur, Korosi, Limbah B3, Elektrolit, K3LH"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Isi Materi Pembelajaran (Mendukung Markdown & Rumus) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan uraian materi lengkap, rumus, studi kasus, atau langkah eksperimen..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editItem ? 'Simpan Perubahan' : 'Upload Modul'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
