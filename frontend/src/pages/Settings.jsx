import React from 'react';
import { API_BASE_URL } from '../api';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-foreground/60">Project configuration and environment details.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
        <h2 className="text-lg font-semibold">API Configuration</h2>
        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
          <p className="text-sm text-foreground/60 mb-1">Current API Base URL</p>
          <p className="font-mono text-sm">{API_BASE_URL}</p>
        </div>
        <p className="text-sm text-foreground/70">
          Change this value by updating <code>VITE_API_BASE_URL</code> in frontend <code>.env</code>.
        </p>
      </div>
    </div>
  );
};

export default Settings;
