import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { postJson } from '../api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am your AI study assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await postJson('/api/chatbot', { message: userMsg.text });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my brain right now." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Sparkles className="text-primary"/>
          AI Assistant
        </h1>
        <p className="text-foreground/60">Ask questions, clarify doubts, and get personalized study tips.</p>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-border flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-primary text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-tr-sm' 
                  : 'bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-white">
                <Bot size={20} />
              </div>
              <div className="max-w-[75%] p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/2 dark:bg-white/2 border-t border-border">
          <form onSubmit={sendMessage} className="flex gap-4 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 px-6 py-4 rounded-xl bg-background border border-border outline-none focus:border-primary transition-all pr-14"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2.5 bg-primary text-white rounded-lg disabled:opacity-50 transition-all hover:bg-primary/90"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
