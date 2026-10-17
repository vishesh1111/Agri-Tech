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
  Sprout,
  Droplets,
  CloudSun,
  ArrowUpRight,
  BookOpen,
  X,
} from 'lucide-react';
import { useKisanStore } from '@/stores/useKisanStore';
import { Card, Badge } from '@/components/ui/Card';

export function AIAgentScreen() {
  const {
    chatMessages,
    isAgentThinking,
    sendChatMessage,
    navigateToSubScreen,
    currentLanguage,
    farms,
    selectedFarmId,
    crops,
    farmWeather,
  } = useKisanStore();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const activeCrop = crops[0];

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
    'Wheat mandi price comparison today?',
    'How much water does Field 1 require?',
    'Brown spots on wheat leaves remedy?',
    'Fertilizer dosage for 5 acres of wheat?',
    'Vaccination reminder for dairy cattle?',
    'Best spraying window before rainfall?',
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900">
              AI Farm Assistant
            </h1>
            <Badge variant="neutral">
              {currentLanguage.displayName}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Gemini AI • Multi-Key Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ask questions about crop diseases, weather advisory, fertilizer doses, and mandi prices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reference Button to view farm reference & model details */}
          <button
            onClick={() => setShowReferenceModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 transition-colors shadow-2xs cursor-pointer"
            title="View Farm Reference & Model Details"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Reference</span>
          </button>

          <button
            onClick={() => navigateToSubScreen('crop_doctor')}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
          >
            <Stethoscope className="h-3.5 w-3.5 text-zinc-500" />
            <span>Crop Doctor (Vision)</span>
          </button>
        </div>
      </div>

      {/* 2. Main Full-Width Chat Container */}
      <div className="w-full flex flex-col bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden h-[calc(100vh-14rem)] min-h-[520px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mb-3 shadow-xs">
                🌾
              </div>
              <h3 className="font-semibold text-zinc-800 text-sm">
                Namaste! How can I help your farm today?
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ask about crop protection, real-time weather advisory, mandi rates, or fertilizer recommendations.
              </p>
            </div>
          )}

          {chatMessages.map((msg, idx) => {
            const isUser = msg.isFromUser;
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                    isUser
                      ? 'bg-zinc-100 border border-zinc-200 text-zinc-700'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed max-w-xl ${
                    isUser
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-50 border border-zinc-200/80 text-zinc-800 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    {msg.timeFormatted || 'Just now'}
                  </span>
                </div>
              </div>
            );
          })}

          {isAgentThinking && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-xl px-4 py-2.5 bg-zinc-50 border border-zinc-200/80 text-xs flex items-center gap-2 text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-200" />
                <span className="text-[11px] font-medium text-emerald-800 ml-1">
                  KisanTech is consulting crop agronomy models...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Horizontal Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 hidden sm:inline">
            Suggestions:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendChatMessage(prompt)}
              className="shrink-0 text-xs bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 px-3 py-1.5 rounded-full border border-zinc-200/90 text-zinc-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-1.5 shadow-2xs cursor-pointer group"
            >
              <span>{prompt}</span>
              <ArrowUpRight className="h-3 w-3 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 bg-white">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer ${
                isRecording
                  ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
              title="Voice Input"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${currentLanguage.displayName} (e.g. fertilizer dose, yellow leaves, mandi prices)...`}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all duration-200"
            />

            <button
              type="submit"
              disabled={!input.trim() || isAgentThinking}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 hover:scale-105 active:scale-90 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Farm Reference & AI Telemetry Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="max-w-xl w-full p-5 sm:p-6 space-y-4 bg-white rounded-xl border border-zinc-200 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <BookOpen className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-base text-zinc-900">
                  Farm Reference & Model Details
                </h3>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Farm Reference Data Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                  Farm Reference Data
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {activeFarm?.name} ({activeFarm?.totalArea || 5} {activeFarm?.unit || 'Acres'})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <span className="text-zinc-500 flex items-center gap-1.5 text-[11px]">
                    <Sprout className="h-3.5 w-3.5 text-zinc-400" />
                    Primary Crop
                  </span>
                  <span className="font-semibold text-zinc-900 block">
                    {activeCrop?.cropName || 'Wheat'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {activeCrop?.growthStage || 'Tillering & Vegetative'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <span className="text-zinc-500 flex items-center gap-1.5 text-[11px]">
                    <CloudSun className="h-3.5 w-3.5 text-zinc-400" />
                    Spray Condition
                  </span>
                  <span className="font-semibold text-emerald-700 block">
                    {farmWeather?.sprayingWindowStatus || 'OPTIMAL'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {farmWeather ? `${farmWeather.currentTempC ?? farmWeather.currentTemp}°C · ${activeFarm?.district || 'Ludhiana'}` : 'Good spray window'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <span className="text-zinc-500 flex items-center gap-1.5 text-[11px]">
                    <Droplets className="h-3.5 w-3.5 text-zinc-400" />
                    Soil Moisture
                  </span>
                  <span className="font-semibold text-zinc-900 block">
                    62% (Good)
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Optimal root zone hydration
                  </span>
                </div>
              </div>
            </div>

            {/* Gemini Multi-Key Pool Card (Matching user screenshot) */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Gemini Multi-Key Pool
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Powered by Google Gemini 3.8 Flash with 4 rotated SIH 2026 API keys for automatic rate limit protection and instant failover.
              </p>
              <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-xs text-zinc-600">
                <span>Pool Size:</span>
                <span className="font-semibold text-zinc-900">4 Validated Keys</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Failover Strategy:</span>
                <span className="font-semibold text-zinc-900">Round-Robin & Offline</span>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-900 block">
                Suggested Questions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setShowReferenceModal(false);
                      sendChatMessage(prompt);
                    }}
                    className="w-full text-left text-xs bg-zinc-50 hover:bg-zinc-100 p-2.5 rounded-lg border border-zinc-100 text-zinc-700 hover:text-zinc-900 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowReferenceModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAgentScreen;
