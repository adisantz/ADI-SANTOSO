import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Mengapa korosi di pesisir Surabaya lebih cepat?',
  'Bagaimana sistem PLTS Atap di gedung SMK?',
  'Jelaskan jalur Sesar Waru-Surabaya secara ringkas!',
  'Apa dampak oli bekas terhadap tanah dan air?',
];

export const AITutorDrawer: React.FC = () => {
  const { playChime, explainQuestionAI } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten AI IPAS SMK PGRI 5 Surabaya. Ada materi sains alam, lingkungan, atau aplikasi kejuruan yang ingin kamu tanyakan hari ini?',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    playChime('click');

    try {
      const response = await explainQuestionAI(textToSend, 'IPAS Terpadu SMK');
      const aiMsg: Message = {
        sender: 'ai',
        text: response,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      playChime('success');
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Konsep tersebut sangat penting dalam mata pelajaran IPAS. Hubungkan fenomena tersebut dengan pengamatan di lingkungan sekitar bengkel atau kota Surabaya ya!',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            playChime('click');
          }}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-2xl hover:scale-105 hover:shadow-indigo-500/40 transition-all cursor-pointer ring-4 ring-white/30"
          title="Tanya AI Tutor IPAS"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Tanya AI Tutor IPAS</span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Tutor AI IPAS Vokasi</h3>
                <p className="text-[11px] text-blue-100">SMK PGRI 5 Surabaya</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    msg.sender === 'user' ? 'bg-blue-600' : 'bg-indigo-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 p-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Tutor sedang memproses penjelasan...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <p className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase">
              Contoh Pertanyaan Cepat:
            </p>
            <div className="flex gap-1.5 overflow-x-auto p-1 custom-scrollbar">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300 shrink-0 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanyakan konsep IPAS..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
