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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900">
              AI Farm Assistant
            </h1>
            <Badge variant="neutral">
              {currentLanguage.displayName}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ask questions about crop diseases, weather advisory, fertilizer doses, and mandi prices
          </p>
        </div>

        <button
          onClick={() => navigateToSubScreen('crop_doctor')}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors"
        >
          <Stethoscope className="h-3.5 w-3.5 text-zinc-500" />
          <span>Crop Doctor (Vision)</span>
        </button>
      </div>

      {/* 2. Main 12-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-14rem)]">
        {/* Left Column (8 Cols): Chat Feed & Input */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex items-start gap-2.5 ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isFromUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-xl rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.isFromUser
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-50 text-zinc-800 border border-zinc-200/70'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Diagnosis Card if present */}
                  {msg.isDiagnosis && (
                    <div className="mt-2.5 rounded-lg border border-zinc-200 bg-white p-3 text-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-zinc-900">
                          {msg.diagnosisTitle || 'Pathology Report'}
                        </span>
                        {msg.diagnosisConfidence && (
                          <Badge variant="primary">
                            {msg.diagnosisConfidence}% Match
                          </Badge>
                        )}
                      </div>

                      {msg.actionDoToday && (
                        <div className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/70 p-2 rounded-md">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <span><strong>Recommended:</strong> {msg.actionDoToday}</span>
                        </div>
                      )}

                      {msg.actionAvoid && (
                        <div className="flex items-start gap-2 text-xs text-rose-900 bg-rose-50/70 p-2 rounded-md">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
                          <span><strong>Avoid:</strong> {msg.actionAvoid}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`mt-1 block text-[10px] ${
                      msg.isFromUser ? 'text-zinc-400 text-right' : 'text-zinc-400'
                    }`}
                  >
                    {msg.timeFormatted}
                  </span>
                </div>

                {msg.isFromUser && (
                  <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 text-xs font-medium">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isAgentThinking && (
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-xs text-zinc-600">
                    Consulting farm database...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Minimal Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-zinc-200/80 bg-white flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-lg border transition-colors ${
                isRecording
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
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
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-300 outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!input.trim() || isAgentThinking}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Column (4 Cols): Live Farm Context & Queries */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto">
          {/* Active Farm Context */}
          <Card className="p-4 space-y-3">
            <span className="text-xs font-semibold text-zinc-900 block">
              Farm Reference Data
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-zinc-400" />
                  Primary Crop
                </span>
                <span className="font-medium text-zinc-800">
                  {activeCrop?.cropName || 'Wheat'} ({activeCrop?.growthStage || 'Tillering'})
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <CloudSun className="h-3.5 w-3.5 text-zinc-400" />
                  Spray Condition
                </span>
                <span className="font-medium text-emerald-700">
                  {farmWeather?.sprayingWindowStatus || 'OPTIMAL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-zinc-400" />
                  Soil Moisture
                </span>
                <span className="font-medium text-zinc-800">62% (Good)</span>
              </div>
            </div>
          </Card>

          {/* Quick Prompts */}
          <Card className="p-4 space-y-2.5">
            <span className="text-xs font-semibold text-zinc-900 block">
              Suggested Questions
            </span>

            <div className="space-y-1.5">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendChatMessage(prompt)}
                  className="w-full text-left text-xs bg-zinc-50 hover:bg-zinc-100 p-2 rounded-lg border border-zinc-100 text-zinc-700 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowUpRight className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AIAgentScreen;
