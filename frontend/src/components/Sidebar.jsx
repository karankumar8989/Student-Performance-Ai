import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, BookOpen, Calendar, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'AI Assistant', path: '/chatbot', icon: MessageSquareText },
    { name: 'Smart Notes', path: '/notes', icon: BookOpen },
    { name: 'Study Schedule', path: '/schedule', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full glass-card border-r border-border/50 flex flex-col transition-all duration-300 z-20 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          AI
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 mt-1">
          EduTrack
        </h1>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5'
                }`
              }
            >
              <Icon size={20} className="mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
