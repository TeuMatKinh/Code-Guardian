/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { User, Progress, AuthState } from "./types";
import { api } from "./lib/api";
import { TRANSLATIONS } from "./constants";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseView from "./pages/CourseView";

const AuthContext = createContext<{
  state: AuthState;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  t: any;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default function App() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    progress: [],
    loading: true,
  });

  const refreshUser = async () => {
    if (!state.token) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    try {
      const { user, progress } = await api.getMe();
      setState(s => ({ ...s, user, progress, loading: false }));
    } catch (e) {
      localStorage.removeItem("token");
      setState(s => ({ ...s, token: null, user: null, loading: false }));
    }
  };

  useEffect(() => {
    refreshUser();
  }, [state.token]);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setState(s => ({ ...s, token, user, loading: false }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setState({ user: null, token: null, progress: [], loading: false });
  };

  const t = TRANSLATIONS[state.user?.language || 'en'];

  useEffect(() => {
    if (state.user?.theme) {
      document.documentElement.className = state.user.theme;
    } else {
      document.documentElement.className = 'dark';
    }
  }, [state.user?.theme]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-brand-400 font-mono">Initializing Code Guardian...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, refreshUser, t }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!state.token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!state.token ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={state.token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/course/:courseId" element={state.token ? <CourseView /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
