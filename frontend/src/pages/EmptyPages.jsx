import React from 'react';

const emptyPage = (title, description) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <h2 className="text-4xl font-bold pl-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">AI</h2>
    </div>
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <p className="text-foreground/60 max-w-md mx-auto">{description}</p>
  </div>
);

export const Students = () => emptyPage("Weak Student Detection", "Automatically identifies weak students and classifies them using Machine Learning models. Table and data grid coming soon.");
export const Chatbot = () => emptyPage("AI Student Assistant", "An AI-powered chatbot for doubt solving and personalized study tips. Integration with Gemini API coming soon.");
export const Notes = () => emptyPage("AI Notes Generator", "Generate short, bullet-point summaries and important formulas for each subject automatically.");
export const Schedule = () => emptyPage("Smart Study Schedule Generator", "Personalized study timetable based on student weaknesses and upcoming exams.");
export const Login = ({ onLogin }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onLogin) {
            onLogin();
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="glass-card p-10 rounded-2xl w-[400px] text-center border border-border">
                <h1 className="text-3xl font-bold mb-2">EduTrack AI</h1>
                <p className="text-foreground/60 mb-8">Login to your dashboard</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all" />
                    <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all" />
                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg hover:shadow-primary/50 transition-all mt-4">Sign In</button>
                </form>
            </div>
        </div>
    )
}
