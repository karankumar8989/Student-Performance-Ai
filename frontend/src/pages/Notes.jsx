import React, { useState } from 'react';
import { BookOpen, FileText, Download } from 'lucide-react';
import { postJson } from '../api';

const Notes = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNotes = async () => {
    if (!topic || !subject) return;
    setLoading(true);
    setError('');
    try {
      const data = await postJson('/api/generate_notes', { topic, subject });
      setNotes(data);
    } catch (e) {
      setError(e.message || 'Unable to generate notes right now.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Notes Generator</h1>
        <p className="text-foreground/60">Automatically generate concise, high-yield revision notes for any topic.</p>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-border flex flex-wrap md:flex-nowrap items-end gap-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input 
            type="text" 
            placeholder="e.g. Biology"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex-2 min-w-[250px] w-full md:w-auto">
          <label className="block text-sm font-medium mb-2">Topic or Concept</label>
          <input 
            type="text" 
            placeholder="e.g. Photosynthesis"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all"
          />
        </div>
        <button 
          onClick={generateNotes}
          disabled={loading || !topic || !subject}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-primary/40 transition-all h-[50px] w-full md:w-auto flex items-center justify-center gap-2"
        >
          <BookOpen size={18} />
          {loading ? 'Generating...' : 'Generate Notes'}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

      {notes && (
        <div className="glass-card p-8 rounded-2xl border border-primary/20 bg-primary/5 mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-6 border-b border-border/50 pb-6">
            <div>
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-1">{notes.subject}</p>
              <h2 className="text-2xl font-bold">{notes.topic} Review Notes</h2>
            </div>
            <button className="p-2 bg-white dark:bg-black rounded-lg border border-border text-foreground/70 hover:text-primary transition-colors">
              <Download size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {notes.notes.map((line, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="mt-1">
                  <FileText size={16} className="text-primary" />
                </div>
                {line.startsWith('**') ? (
                  <p className="text-lg font-medium leading-relaxed">{line.replace(/\*\*/g, '')}</p>
                ) : (
                  <p className="text-foreground/80 leading-relaxed">{line}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
