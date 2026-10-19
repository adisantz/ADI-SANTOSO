import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppTheme } from '../types/ipas';
import {
  Settings,
  Palette,
  User,
  Check,
  CheckCircle2,
  Volume2,
  VolumeX,
  Type,
  Sparkles,
  RotateCcw,
  Camera,
  School,
  Save,
  Moon,
  Sun,
  Shield,
  Smartphone,
} from 'lucide-react';

const THEME_OPTIONS: { id: AppTheme; name: string; description: string; colors: string[] }[] = [
  {
    id: 'pgri-blue',
    name: 'PGRI Biru Harmoni',
    description: 'Warna resmi identitas PGRI dengan aksen biru laut terpercaya dan emas.',
    colors: ['#1e40af', '#3b82f6', '#dbeafe'],
  },
  {
    id: 'emerald-surabaya',
    name: 'Suroboyo Emerald',
    description: 'Nuansa hijau daun & mangrove Wonorejo, sejuk untuk kepedulian lingkungan IPAS.',
    colors: ['#047857', '#10b981', '#d1fae5'],
  },
  {
    id: 'indigo-modern',
    name: 'Kreatif Indigo',
    description: 'Sentuhan modern futuristik ungu-indigo untuk kreativitas vokasi teknologi.',
    colors: ['#4f46e5', '#8b5cf6', '#e0e7ff'],
  },
  {
    id: 'amber-warm',
    name: 'Sunset Amber Surabaya',
    description: 'Warna hangat senja kota Surabaya yang memicu fokus belajar dan energi positif.',
    colors: ['#d97706', '#f59e0b', '#fef3c7'],
  },
  {
    id: 'dark-mode',
    name: 'Mode Gelap Cyber Vokasi',
    description: 'Latar gelap elegan dengan kontras ramah mata untuk belajar malam hari.',
    colors: ['#0f172a', '#38bdf8', '#1e293b'],
  },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
];

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    settings,
    setTheme,
    updateSettings,
    playChime,
    resetSubmissions,
  } = useApp();

  // Profile form state
  const [name, setName] = useState(currentUser.name);
  const [idNumber, setIdNumber] = useState(currentUser.idNumber);
  const [email, setEmail] = useState(currentUser.email);
  const [department, setDepartment] = useState(currentUser.department);
  const [className, setClassName] = useState(currentUser.className || '');
  const [bio, setBio] = useState(currentUser.bio);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      idNumber,
      email,
      department,
      className,
      bio,
      avatar,
      phone,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-amber-300" />
            <span>Kustomisasi Akun & Tampilan Pribadi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pengaturan & Personalisasi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Sesuaikan tema visual, profil sekolah, ukuran font, dan preferensi audio aplikasi IPAS SMK PGRI 5 Surabaya.
          </p>
        </div>
      </div>

      {showSavedToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">Profil berhasil diperbarui dan tersimpan!</span>
        </div>
      )}

      {/* SECTION 1: GANTI TEMA (THEME SELECTOR) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Ganti Tema Warna Aplikasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih palet tema khas SMK PGRI 5 Surabaya yang paling nyaman untuk Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = settings.theme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {theme.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {theme.description}
                  </p>
                </div>

                {/* Color swatches */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {theme.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: c }}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PROFIL PENGGUNA (USER PROFILE FORM) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Profil Akun Pengguna ({currentUser.role === 'guru' ? 'Guru IPAS' : 'Peserta Didik'})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informasi identitas akademik resmi di lingkungan SMK PGRI 5 Surabaya.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Foto Avatar Profil:
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500 shadow-md"
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt={`Preset ${idx}`}
                    onClick={() => {
                      setAvatar(av);
                      playChime('click');
                    }}
                    className={`w-10 h-10 rounded-xl object-cover cursor-pointer hover:scale-105 transition-all ${
                      avatar === av ? 'ring-2 ring-blue-600 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {currentUser.role === 'guru' ? 'NIP / NUPTK' : 'Nomor Induk Siswa (NIS/NISN)'}
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Surel / Email Sekolah
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / Kontak
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program Keahlian / Jurusan SMK
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Teknik Kendaraan Ringan Otomotif (TKRO)"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {currentUser.role === 'siswa' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rombel / Kelas Siswa
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="X TKR 1"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Motto Belajar & Visi Sains Vokasi
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tuliskan motivasi belajar IPAS atau harapan untuk sekolah..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Saya</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: AKSESIBILITAS & PREFERENSI SISTEM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Type className="w-4 h-4 text-indigo-600" />
          <span>Aksesibilitas & Pengalaman Pengguna</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sound Effects */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Efek Suara Interaktif
              </p>
              <p className="text-[11px] text-slate-500">
                Audio umpan balik saat menjawab soal kuis dan submit.
              </p>
            </div>
            <button
              onClick={() => {
                updateSettings({ soundEnabled: !settings.soundEnabled });
                playChime('click');
              }}
              className={`p-2 rounded-xl transition-colors ${
                settings.soundEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Reset Data Simulasi
              </p>
              <p className="text-[11px] text-slate-500">
                Kembalikan riwayat kuis dan rekap performa ke kondisi awal.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset seluruh data simulasi siswa ke data awal?')) {
                  resetSubmissions();
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
