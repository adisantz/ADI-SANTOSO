import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  FileQuestion,
  LayoutDashboard,
  BarChart3,
  Settings,
  Sparkles,
  Users,
  Palette,
  Sun,
  Moon,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    settings,
    setTheme,
    activeTab,
    setActiveTab,
    playChime,
    submissions,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Active in-progress students count for live badge
  const activeNowCount = submissions.filter((s) => s.status === 'sedang_mengerjakan').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('materi')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <div className="w-full h-full bg-slate-900/20 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  IPAS Smart Learn
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  SMK PGRI 5 SBY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Projek IPAS Vokasi Berbasis AI • Kurikulum Merdeka
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => {
                setActiveTab('materi');
                playChime('click');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'materi'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Modul & Materi</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('kuis');
                playChime('click');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'kuis'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileQuestion className="w-4 h-4" />
              <span>Kuis & Tugas</span>
            </button>

            {currentUser.role === 'guru' && (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  playChime('click');
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Guru</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('analisis');
                playChime('click');
              }}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analisis'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analisis Real-Time</span>
              {activeNowCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('pengaturan');
                playChime('click');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pengaturan'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Right Controls: Role Switcher & Profile Card */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                title="Ganti Tema Warna"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </button>

              {themeMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setThemeMenuOpen(false)}
                >
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Pilih Tema Warna
                  </p>
                  <button
                    onClick={() => {
                      setTheme('pgri-blue');
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-700 border border-white"></span>
                      <span>PGRI Biru Harmoni</span>
                    </div>
                    {settings.theme === 'pgri-blue' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme('emerald-surabaya');
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white"></span>
                      <span>Suroboyo Emerald</span>
                    </div>
                    {settings.theme === 'emerald-surabaya' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme('indigo-modern');
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white"></span>
                      <span>Kreatif Indigo</span>
                    </div>
                    {settings.theme === 'indigo-modern' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme('amber-warm');
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white"></span>
                      <span>Sunset Amber</span>
                    </div>
                    {settings.theme === 'amber-warm' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark-mode');
                      setThemeMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Moon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Mode Gelap</span>
                    </div>
                    {settings.theme === 'dark-mode' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Role Switcher (Simulasi Guru vs Siswa) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  currentUser.role === 'guru'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="capitalize">{currentUser.role === 'guru' ? 'Mode Guru' : 'Mode Siswa'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Ganti Akun Demo</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pilih peran untuk melihat akses & tampilan:</p>
                  </div>
                  <button
                    onClick={() => {
                      switchRole('guru');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-start space-x-2 p-2 rounded-lg text-left text-xs ${
                      currentUser.role === 'guru' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></span>
                    <div>
                      <p className="font-semibold">Guru (Dra. Sri Wahyuni, M.Pd)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Upload modul, kelola 7 tipe kuis, analisis live</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('siswa');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-start space-x-2 p-2 rounded-lg text-left text-xs ${
                      currentUser.role === 'siswa' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></span>
                    <div>
                      <p className="font-semibold">Siswa (Dimas Arya - X TKR 1)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Baca materi IPAS, kerjakan kuis, cek nilai</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar & Click to Settings */}
            <div
              onClick={() => {
                setActiveTab('pengaturan');
                playChime('click');
              }}
              className="flex items-center space-x-2 pl-2 cursor-pointer group"
              title="Klik untuk membuka Pengaturan Profil"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 transition-colors">
                  {currentUser.name.split(',')[0]}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentUser.role === 'guru' ? 'Guru IPAS' : currentUser.className || 'Siswa'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('materi')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'materi' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Materi</span>
          </button>
          <button
            onClick={() => setActiveTab('kuis')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'kuis' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <FileQuestion className="w-4 h-4 mb-0.5" />
            <span>Kuis</span>
          </button>
          {currentUser.role === 'guru' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center py-1 px-2 ${
                activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Guru</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('analisis')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'analisis' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Analisis</span>
          </button>
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`flex flex-col items-center py-1 px-2 ${
              activeTab === 'pengaturan' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            <span>Setelan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
