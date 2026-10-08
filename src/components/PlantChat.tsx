import React, { useState } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { PlantAnalysisResult, Language, ChatMessage } from '../types/plant';
import { translations } from '../i18n/translations';
import { AudioPlayerButton } from './AudioPlayerButton';

interface PlantChatProps {
  analysis: PlantAnalysisResult;
  language: Language;
}

export const PlantChat: React.FC<PlantChatProps> = ({ analysis, language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text:
        language === 'gu'
          ? `નમસ્તે! હું તમારા ${analysis.plant.name_gu} છોડનો AI ડૉક્ટર છું. આ છોડની બીમારી, પાણી, ખાતર કે સંભાળ વિશે કંઈપણ પૂછો!`
          : language === 'hi'
          ? `नमस्ते! मैं आपके ${analysis.plant.name_gu || analysis.plant.name_en} का AI डॉक्टर हूँ। कोई भी प्रश्न पूछें!`
          : `Hello! I am your AI Plant Doctor for this ${analysis.plant.name_en}. Feel free to ask me anything about care, watering, fertilizers, or diseases!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          plantContext: {
            plant: analysis.plant,
            health: analysis.health,
            diseases: analysis.possible_diseases,
            pests: analysis.possible_pests,
            symptoms: analysis.visual_symptoms,
            watering: analysis.watering,
            fertilizer: analysis.fertilizer,
          },
          history: messages.slice(-5),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat service error');
      }

      const data = await response.json();
      const aiReplyText = data.reply || 'માફ કરશો, જવાબ તૈયાર કરવામાં સમસ્યા આવી.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat submit error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'gu'
            ? 'નેટવર્ક અથવા સર્વરમાં ક્ષતિ જણાય છે. કૃપા કરીને થોડીવાર પછી ફરી પૂછો.'
            : 'Error communicating with AI Doctor. Please try again shortly.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white border border-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <span>{t.askDoctor}</span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
            </h3>
            <p className="text-[11px] text-emerald-200">
              {analysis.plant.name_gu} ({analysis.plant.scientific_name})
            </p>
          </div>
        </div>
        <MessageSquare className="w-5 h-5 text-emerald-300" />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="p-3 bg-emerald-50/50 border-b border-emerald-100/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>ઝડપી પ્રશ્નો:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {t.quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 bg-white hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs rounded-full whitespace-nowrap font-medium transition-colors shadow-2xs active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto bg-stone-50/40">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-white text-stone-800 border border-stone-200 shadow-2xs'
                    : 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Gujarati Voice Output button on each AI message */}
                {isAI && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <AudioPlayerButton
                      textToSpeak={m.text}
                      language={language}
                      compact
                    />
                    <span className="text-[10px] text-stone-600 font-medium">
                      AI Doctor
                    </span>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-full bg-stone-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-600 text-xs bg-white p-3 rounded-2xl border border-stone-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>AI ડૉક્ટર જવાબ લખી રહ્યા છે...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 text-xs bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 focus:border-emerald-500 rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-stone-600 text-stone-800"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white disabled:opacity-40 transition-all shadow-xs"
          title={t.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
