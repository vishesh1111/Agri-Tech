'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Stethoscope,
  Sparkles,
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card } from '@/components/ui/Card';

export function AIAgentScreen() {
  const {
    chatMessages,
    isAgentThinking,
    sendChatMessage,
    navigateToSubScreen,
    currentLanguage,
  } = useKisanStore();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAgentThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isAgentThinking) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  // Browser Web Speech API for voice recognition in Indian languages
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Try Chrome on Android, Windows or Mac.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCode =
        currentLanguage.code === 'hi'
          ? 'hi-IN'
          : currentLanguage.code === 'pa'
          ? 'pa-IN'
          : currentLanguage.code === 'mr'
          ? 'mr-IN'
          : currentLanguage.code === 'bn'
          ? 'bn-IN'
          : 'en-IN';

      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const quickPrompts = [
    '🌾 Wheat mandi price today?',
    '💧 How much water for Field 1?',
    '🐛 Brown leaf spots on my wheat?',
    '🧪 Fertilizer dosage for 5 acres?',
    '🐄 Cattle vaccination reminder?',
  ];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col pb-2">
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
              Autonomous Farm Agent
            </h2>
            <p className="text-[11px] text-gray-500">
              Voice & Text Multilingual Assistant ({currentLanguage.displayName})
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateToSubScreen('crop_doctor')}
          className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
        >
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Crop Doctor</span>
        </button>
      </div>

      {/* 2. Message History */}
      <div className="flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin">
        {chatMessages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex items-start gap-2 ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
          >
            {!msg.isFromUser && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                msg.isFromUser
                  ? 'bg-emerald-600 text-white rounded-br-xs'
                  : 'bg-white text-gray-800 border border-gray-100 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 rounded-bl-xs'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Diagnosis Card Attachment if present */}
              {msg.isDiagnosis && (
                <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-gray-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                      {msg.diagnosisTitle || 'Pathology Report'}
                    </span>
                    {msg.diagnosisConfidence && (
                      <span className="rounded-full bg-emerald-200/80 px-2 py-0.2 text-[9px] font-bold text-emerald-900">
                        {msg.diagnosisConfidence}% Match
                      </span>
                    )}
                  </div>

                  {msg.actionDoToday && (
                    <div className="flex items-start gap-1 text-[11px] text-emerald-900 dark:text-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{msg.actionDoToday}</span>
                    </div>
                  )}

                  {msg.actionAvoid && (
                    <div className="flex items-start gap-1 text-[11px] text-rose-900 dark:text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
                      <span>{msg.actionAvoid}</span>
                    </div>
                  )}
                </div>
              )}

              <span
                className={`mt-1 block text-[10px] ${
                  msg.isFromUser ? 'text-emerald-100 text-right' : 'text-gray-400'
                }`}
              >
                {msg.timeFormatted}
              </span>
            </div>

            {msg.isFromUser && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 shadow-xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isAgentThinking && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white animate-pulse">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <span>KisanAI is consulting farm data and agronomy models...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Suggestion Prompts */}
      <div className="flex gap-1.5 overflow-x-auto px-2 py-1 scrollbar-none">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => sendChatMessage(p.slice(2).trim())}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-50 active:scale-95 transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Bar */}
      <form onSubmit={handleSend} className="p-2">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-md'
                : 'text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
            title="Speak in your language"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening... बोलिए...'
                : `Ask KisanAI (${currentLanguage.nativeName})...`
            }
            className="flex-1 bg-transparent px-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden dark:text-zinc-100"
          />

          <button
            type="button"
            onClick={() => navigateToSubScreen('crop_doctor')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Attach Leaf Image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isAgentThinking}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default AIAgentScreen;
