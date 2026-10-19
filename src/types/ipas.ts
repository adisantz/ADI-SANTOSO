export type QuestionType =
  | 'pilihan_ganda'
  | 'pg_kompleks'
  | 'benar_salah'
  | 'bs_kompleks'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'uraian';

export type IPASAspect =
  | 'Makhluk Hidup dan Lingkungannya'
  | 'Zat dan Perubahannya'
  | 'Energi dan Perubahannya'
  | 'Bumi dan Antariksa'
  | 'Keruangan dan Konektivitas'
  | 'Interaksi dan Dinamika Sosial'
  | 'Perilaku Ekonomi dan Kesejahteraan';

export interface MatrixStatement {
  id: string;
  statement: string;
  correctBool: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  context?: string; // Stimulus teks, narasi kasus industri atau sains
  imageUrl?: string;
  points: number;
  aspect: IPASAspect;
  difficulty: 'mudah' | 'sedang' | 'sukar';
  explanation: string;

  // Type specific data
  options?: string[]; // pilihan_ganda & pg_kompleks
  correctOptionIndex?: number; // pilihan_ganda (single answer, 0-based)
  correctOptionIndices?: number[]; // pg_kompleks (multiple answers, e.g. [0, 2])
  correctBool?: boolean; // benar_salah sederhana
  matrixItems?: MatrixStatement[]; // bs_kompleks
  matchingPairs?: MatchingPair[]; // menjodohkan
  correctShortAnswers?: string[]; // isian_singkat (alternatif kata kunci)
  rubricGuide?: string; // uraian (pedoman penskoran & kata kunci wajib)
}

export interface Quiz {
  id: string;
  title: string;
  aspect: IPASAspect;
  description: string;
  targetClasses: string[];
  durationMinutes: number;
  passingScore: number; // KKTP (contoh 75)
  questions: Question[];
  createdAt: string;
  isPublished: boolean;
}

export interface ModuleItem {
  id: string;
  title: string;
  aspect: IPASAspect;
  chapterNumber: number;
  targetClasses: string[];
  readTimeMinutes: number;
  summary: string;
  content: string;
  keyConcepts: string[];
  vocationalConnection: string; // Hubungan dengan dunia kerja SMK
  fileUrl?: string;
  fileName?: string;
  author: string;
  createdAt: string;
}

export interface StudentAnswerRecord {
  questionId: string;
  type: QuestionType;
  answer: any;
  isCorrect?: boolean;
  scoreEarned: number;
  maxScore: number;
  feedback?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAvatar?: string;
  answers: Record<string, any>; // questionId -> answer
  records: StudentAnswerRecord[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
  status: 'selesai' | 'sedang_mengerjakan';
  aspectBreakdown?: Record<string, { earned: number; max: number }>;
}

export type AppTheme =
  | 'pgri-blue'
  | 'emerald-surabaya'
  | 'indigo-modern'
  | 'amber-warm'
  | 'dark-mode';

export interface UserProfile {
  id: string;
  role: 'guru' | 'siswa';
  name: string;
  idNumber: string; // NIP atau NIS
  email: string;
  avatar: string;
  schoolName: string;
  department: string; // Jurusan SMK: TKR, RPL, AKL, TBSM, dll
  className?: string; // Untuk siswa, misal "X TKR 1"
  subjects?: string[]; // Untuk guru, misal ["IPAS Kelas X"]
  bio: string;
  phone?: string;
}

export interface UserSettings {
  theme: AppTheme;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  remedialSuggestions: string[];
  enrichmentSuggestions: string[];
  teacherReflection: string;
}
