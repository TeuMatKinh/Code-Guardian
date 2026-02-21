import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { Course } from "../types";
import Navbar from "../components/Navbar";
import { motion } from "motion/react";
import { Flame, Trophy, BookOpen, ChevronRight, CheckCircle2, Lock } from "lucide-react";

export default function Dashboard() {
  const { state, t } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const getProgress = (courseId: string) => {
    return state.progress.filter(p => p.course_id === courseId).length;
  };

  const isDayUnlocked = (courseId: string, dayNumber: number) => {
    if (dayNumber === 1) return true;
    return state.progress.some(p => p.course_id === courseId && p.day_number === dayNumber - 1);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero / Streak Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center"
          >
            <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              You're on a roll! Keep up the momentum and master your skills.
            </p>
            <div className="flex gap-4">
              <Link 
                to={`/course/${courses[0]?.id}`}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                {t.continue}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-3xl text-white shadow-xl shadow-orange-500/20 flex flex-col items-center justify-center text-center"
          >
            <Flame className="w-16 h-16 mb-4 animate-bounce" />
            <div className="text-5xl font-black mb-1">{state.user?.streak_count}</div>
            <div className="text-lg font-bold uppercase tracking-wider opacity-90">{t.streak}</div>
            <p className="mt-4 text-sm opacity-80 italic">"Consistency is the key to mastery."</p>
          </motion.div>
        </div>

        {/* Courses Section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-500" />
          {t.courses}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const completedDays = getProgress(course.id);
            const progressPercent = (completedDays / course.days.length) * 100;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-brand-500 transition-colors">{course.name}</h3>
                    <Trophy className={`w-6 h-6 ${completedDays === course.days.length ? 'text-yellow-500' : 'text-slate-300'}`} />
                  </div>
                  
                  <div className="space-y-4">
                    {course.days.map(day => {
                      const isCompleted = state.progress.some(p => p.course_id === course.id && p.day_number === day.day);
                      const isUnlocked = isDayUnlocked(course.id, day.day);

                      return (
                        <Link 
                          key={day.day}
                          to={isUnlocked ? `/course/${course.id}?day=${day.day}` : "#"}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isCompleted 
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                              : isUnlocked 
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-500' 
                                : 'bg-slate-100 dark:bg-slate-900/50 border-transparent opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold opacity-60">DAY {day.day}</span>
                            <span className="text-sm font-medium">{day.title}</span>
                          </div>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : !isUnlocked && <Lock className="w-4 h-4" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>PROGRESS</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-brand-500"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
