import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import { Students, Chatbot, Notes, Schedule, Login, Signup, Settings, Landing } from './pages';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleSignup = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden w-full relative ${!isAuthenticated ? 'z-0' : ''}`}>
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {isAuthenticated && <Header darkMode={darkMode} setDarkMode={setDarkMode} />}
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-transparent z-10 w-full max-w-full ${isAuthenticated ? 'p-6' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup onSignup={handleSignup} />} />

            {/* Private Routes */}
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/students" element={isAuthenticated ? <Students /> : <Navigate to="/login" />} />
            <Route path="/chatbot" element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />} />
            <Route path="/notes" element={isAuthenticated ? <Notes /> : <Navigate to="/login" />} />
            <Route path="/schedule" element={isAuthenticated ? <Schedule /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
