import { useAuth } from "../App";
import { LogOut, Moon, Sun, Languages, Shield } from "lucide-react";
import { api } from "../lib/api";

export default function Navbar() {
  const { state, logout, refreshUser, t } = useAuth();

  const toggleTheme = async () => {
    const newTheme = state.user?.theme === 'light' ? 'dark' : 'light';
    await api.updateSettings({ language: state.user?.language || 'en', theme: newTheme });
    refreshUser();
  };

  const toggleLanguage = async () => {
    const newLang = state.user?.language === 'en' ? 'vi' : 'en';
    await api.updateSettings({ language: newLang, theme: state.user?.theme || 'dark' });
    refreshUser();
  };

  return (
    <nav className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-brand-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
          Code Guardian
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Languages className="w-5 h-5" />
          <span className="uppercase">{state.user?.language}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {state.user?.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{state.user?.email.split('@')[0]}</p>
            <p className="text-xs text-slate-500">{t.streak}: {state.user?.streak_count}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
