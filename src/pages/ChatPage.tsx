import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Send,
  Bot,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ListOrdered,
  BookOpen,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { t, language, currentResult } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('action_path_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-1',
        role: 'model',
        text:
          language === 'Hindi'
            ? 'नमस्ते! मैं आपका सहायक (Sahayak) हूँ। सरकारी नोटिस, पेंशन प्रमाण पत्र, बैंक पत्र या किसी भी कठिन शब्द को सरल भाषा में समझने के लिए आप मुझसे पूछ सकते हैं। आप क्या जानना चाहते हैं?'
            : language === 'Marathi'
            ? 'नमस्कार! मी आपला मार्गदर्शक सहायक आहे. कोणताही सरकारी फॉर्म, पेन्शन नोटीस किंवा बँकेचे पत्र समजून घेण्यासाठी आपण मला विचारू शकता. मी कशी मदत करू?'
            : 'Hello! I am Sahayak, your Action Path Assistant. You can ask me to explain any difficult word, clarify a notice, or tell you what step to take next. What would you like to know?',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'guide' | 'explainer' | 'checklist'>('guide');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save conversation to localStorage
  useEffect(() => {
    localStorage.setItem('action_path_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Stop speech synthesis when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInput('');
    setIsLoading(true);

    // Determine task complexity:
    // 'fast' for explainer (gemini-3.1-flash-lite)
    // 'general' for guide / checklist (gemini-3.8-flash)
    const taskType = role === 'explainer' ? 'fast' : 'general';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, text: m.text })),
          language,
          taskType,
          role,
          activeDocumentContext: currentResult,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      console.error('Chat send error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text:
          language === 'Hindi'
            ? 'माफ़ कीजिए, उत्तर प्राप्त करने में कुछ कठिनाई हुई। कृपया दोबारा पूछें।'
            : language === 'Marathi'
            ? 'माफ करा, उत्तर मिळवण्यात अडचण आली. कृपया पुन्हा विचारा.'
            : 'I had trouble answering that right now. Please try asking again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text:
          language === 'Hindi'
            ? 'बातचीत साफ़ कर दी गई है। आप कोई भी नया सवाल पूछ सकते हैं।'
            : language === 'Marathi'
            ? 'संभाषण साफ केले आहे. आपण नवीन प्रश्न विचारू शकता.'
            : 'Conversation cleared. What would you like help with next?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Read aloud a message
  const handleReadMessage = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    if (speakingMsgId === msgId) {
      synth.cancel();
      setSpeakingMsgId(null);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // patient rate for older adults

    // Voice match
    const voices = synth.getVoices();
    if (voices && voices.length > 0) {
      if (language === 'Hindi') {
        const v = voices.find((vox) => vox.lang.startsWith('hi') || vox.name.includes('Hindi'));
        if (v) utterance.voice = v;
      } else if (language === 'Marathi') {
        const v = voices.find((vox) => vox.lang.startsWith('mr') || vox.lang.startsWith('hi'));
        if (v) utterance.voice = v;
      } else {
        const v = voices.find((vox) => vox.lang === 'en-IN' || vox.lang.startsWith('en'));
        if (v) utterance.voice = v;
      }
    }

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    synth.speak(utterance);
  };

  const starters = [
    t.chatStarter1,
    t.chatStarter2,
    t.chatStarter3,
    t.chatStarter4,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 flex flex-col h-[calc(100vh-10rem)] min-h-[580px]">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {t.chatTitle}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.chatSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role / Persona Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setRole('guide')}
              className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 min-h-[36px] ${
                role === 'guide'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="General patient guidance (gemini-3.8-flash)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.chatRoleGuide}</span>
            </button>
            <button
              onClick={() => setRole('explainer')}
              className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 min-h-[36px] ${
                role === 'explainer'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fast concise definitions (gemini-3.1-flash-lite)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.chatRoleExplainer}</span>
            </button>
            <button
              onClick={() => setRole('checklist')}
              className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 min-h-[36px] ${
                role === 'checklist'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Numbered step by step checklist"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.chatRoleChecklist}</span>
            </button>
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={handleClear}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600"
            title={t.chatClear}
            aria-label={t.chatClear}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Context Ribbon (if an active document was analyzed) */}
      {currentResult && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="font-semibold">{t.chatDocContextActive}:</span>
            <span className="truncate italic">"{currentResult.title}"</span>
          </div>
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-white ${
                  isUser ? 'bg-slate-800' : 'bg-blue-600'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-2xs space-y-2 ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Footer of Bubble: Timestamp & Listen Audio Button */}
                <div
                  className={`flex items-center justify-between gap-3 text-xs pt-1 border-t ${
                    isUser
                      ? 'border-blue-600 text-blue-200'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <button
                      onClick={() => handleReadMessage(msg.id, msg.text)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                        isSpeaking
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : 'hover:bg-slate-200 text-slate-600'
                      }`}
                      title={isSpeaking ? 'Stop listening' : 'Listen aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.btnListen}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-1.5">
              <p className="text-xs text-slate-500 font-medium">{t.chatThinking}</p>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Questions (Shown when conversation is short) */}
      {messages.length <= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {starters.map((starter, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(starter)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition-colors shadow-2xs"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl border border-slate-300 p-2 shadow-xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 min-h-[44px] shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t.chatSend}</span>
        </button>
      </form>
    </div>
  );
};
