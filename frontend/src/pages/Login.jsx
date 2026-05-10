import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Brain, Globe } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    if (onLogin) onLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[450px] relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-foreground/60">Continue your journey to academic excellence.</p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all focus:ring-4 ring-primary/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all focus:ring-4 ring-primary/10"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-xs font-medium text-foreground/40 uppercase tracking-widest">Or continue with</span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-sm font-bold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <Globe size={20} />
              <span className="text-sm font-bold">Github</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-foreground/60 text-sm">
          Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
