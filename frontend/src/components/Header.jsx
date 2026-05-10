import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';

const Header = ({ darkMode, setDarkMode }) => {
  return (
    <header className="h-20 w-full flex items-center justify-between px-8 z-20 glass-card border-b border-border/50">
      <div className="flex items-center glass rounded-full px-4 py-2 w-96 max-w-full">
        <Search size={18} className="text-foreground/50 mr-2" />
        <input 
          type="text" 
          placeholder="Search students, notes, schedules..." 
          className="bg-transparent border-none outline-none w-full text-sm placeholder:text-foreground/50 text-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground/70 hover:text-foreground"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-foreground/70 hover:text-foreground">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </button>

        <div className="h-8 w-[1px] bg-border/50 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">Admin User</p>
            <p className="text-xs text-foreground/50 mt-1">Teacher</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-[2px]">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Profile" 
              className="w-full h-full rounded-full bg-card"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
