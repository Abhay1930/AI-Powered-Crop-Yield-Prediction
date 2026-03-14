import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Sparkles, Leaf, ChevronDown, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../api/api';
import { useLanguage } from '../context/LanguageContext';

const QUICK_QUESTIONS = [
  { en: '🌾 Best crop for Odisha now?', hi: '🌾 अभी ओडिशा के लिए सबसे अच्छी फसल?', or: '🌾 ଏବେ ଓଡ଼ିଶା ପାଇଁ ଭଲ ଫସଲ?' },
  { en: '💊 How much Urea for Rice?', hi: '💊 चावल के लिए कितना यूरिया?', or: '💊 ଧାନ ପାଇଁ କେତେ ୟୁରିଆ?' },
  { en: '🌧️ Will heavy rain damage wheat?', hi: '🌧️ क्या भारी बारिश गेहूं को नुकसान पहुंचाएगी?', or: '🌧️ ଭାରী ବର୍ଷା ଗହମ ନଷ୍ଟ କରିବ?' },
  { en: '💰 PM-KISAN eligibility?', hi: '💰 PM-KISAN पात्रता?', or: '💰 PM-KISAN ଯୋଗ୍ୟତା?' },
];

export default function KrishiGPT({ weather, prediction, formData }) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: lang === 'hi'
        ? '🌱 नमस्ते! मैं KrishiAI हूँ। आपकी खेती में मदद के लिए तैयार हूँ! कृपया अपना सवाल पूछें।'
        : lang === 'or'
        ? '🌱 ନମସ୍କାର! ମୁଁ KrishiAI। ଆପଣଙ୍କ ଚାଷ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ!'
        : '🌱 Hello! I\'m KrishiAI, your personal farming assistant. Ask me anything about crops, weather, soil, or market prices!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const buildContext = () => ({
    weather: weather ? { temp: weather.temperature, humidity: weather.humidity, location: weather.locationName } : null,
    prediction: prediction ? { yield: prediction.yield, crop: formData?.crop_type } : null,
    state: formData?.state || 'Odisha'
  });

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage(text, lang, buildContext());
      setMessages(prev => [...prev, { role: 'ai', text: res.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Sorry, AI service is unavailable. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input requires Chrome browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'or' ? 'or-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.start();
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end space-y-2 pointer-events-none"
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 uppercase tracking-widest whitespace-nowrap mb-2"
            >
              ✨ New: Ask KrishiAI
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto relative ${isOpen ? 'hidden' : ''}`}
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
        >
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
          
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[560px] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            style={{ background: '#0f1923' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm tracking-tight">KrishiGPT</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-green-200 text-[10px]">Powered by Gemini 2.0</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  {lang === 'hi' ? 'हिंदी' : lang === 'or' ? 'ଓଡ଼ିଆ' : 'English'}
                </span>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="px-3 py-2 flex space-x-2 overflow-x-auto scrollbar-hide" style={{ background: '#141f2e' }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q[lang] || q.en)}
                  className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full font-semibold transition hover:opacity-80"
                  style={{ background: '#1e2f40', color: '#86efac' }}
                >
                  {q[lang] || q.en}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-tr-sm'
                        : 'text-gray-100 rounded-tl-sm'
                    }`}
                    style={msg.role === 'ai' ? { background: '#1e2f40' } : {}}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: '#1e2f40' }}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t" style={{ background: '#141f2e', borderColor: '#1e2f40' }}>
              <div className="flex items-center space-x-2 rounded-2xl px-3 py-2" style={{ background: '#1e2f40' }}>
                <button
                  onClick={handleVoice}
                  className={`p-1.5 rounded-full transition ${isListening ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-green-400'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'hi' ? 'कुछ भी पूछें...' : lang === 'or' ? 'ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...' : 'Ask anything about farming...'}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 bg-green-600 text-white rounded-full disabled:opacity-40 hover:bg-green-500 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
