import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Book } from 'lucide-react';
import { postJson } from '../api';

const Schedule = () => {
  const [hours, setHours] = useState(3);
  const [weakSubjects, setWeakSubjects] = useState('Math, Physics');
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postJson('/api/schedule', {
        available_hours: hours,
        weak_subjects: weakSubjects.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSchedule(data);
    } catch (e) {
      setError(e.message || 'Unable to generate schedule right now.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Study Schedule</h1>
        <p className="text-foreground/60">Generate a personalized timetable based on weaknesses and available study hours.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border flex items-end gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Available Study Hours (Today)</label>
          <input 
            type="number" 
            min="1" max="10" 
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all text-lg"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Weak Subjects (comma separated)</label>
          <input
            type="text"
            value={weakSubjects}
            onChange={(e) => setWeakSubjects(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all"
          />
        </div>
        <button 
          onClick={generateSchedule}
          disabled={loading}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-primary/40 transition-all h-[52px]"
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

      {schedule && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary"/>
              Today's Timetable
            </h3>
            <div className="space-y-4">
              {schedule.daily_timetable.map((slot, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${slot.type === 'Break' ? 'bg-black/5 dark:bg-white/5 border-transparent' : 'bg-primary/5 border-primary/20'}`}>
                  <div className="flex flex-col items-center justify-center min-w-[70px]">
                    <Clock size={18} className={slot.type === 'Break' ? 'text-foreground/50' : 'text-primary'} />
                    <span className="text-xs font-semibold mt-1">{slot.duration}</span>
                  </div>
                  <div className="flex-1 border-l border-border pl-4">
                    <h4 className="font-bold text-sm tracking-wide">{slot.slot}</h4>
                    <p className="text-sm mt-1 text-foreground/80">{slot.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border h-fit">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Book size={20} className="text-blue-500"/>
              Weekly Overview
            </h3>
            <p className="text-foreground/80 leading-relaxed p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm font-medium">
              {schedule.weekly_plan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
