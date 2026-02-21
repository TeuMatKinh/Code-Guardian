import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { Course, Day } from "../types";
import Navbar from "../components/Navbar";
import CodeEditor from "../components/CodeEditor";
import AITutor from "../components/AITutor";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, BookOpen, Code, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";

export default function CourseView() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, refreshUser, t } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentDay, setCurrentDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    api.getCourses().then(courses => {
      const found = courses.find((c: Course) => c.id === courseId);
      if (found) {
        setCourse(found);
        const dayNum = parseInt(searchParams.get("day") || "1");
        setCurrentDay(found.days.find((d: Day) => d.day === dayNum) || found.days[0]);
      }
      setLoading(false);
    });
  }, [courseId, searchParams]);

  const handleComplete = async () => {
    if (!course || !currentDay) return;
    
    // Check if already completed
    const isAlreadyDone = state.progress.some(p => p.course_id === course.id && p.day_number === currentDay.day);
    if (isAlreadyDone) {
      setCompleted(true);
      return;
    }

    try {
      await api.completeDay({ courseId: course.id, dayNumber: currentDay.day });
      await refreshUser();
      setCompleted(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !course || !currentDay) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Content */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-6 lg:p-10 border-r border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors mb-8 text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-black mb-4 uppercase tracking-widest">
              Day {currentDay.day} • {course.name}
            </div>
            <h1 className="text-4xl font-black mb-6">{currentDay.title}</h1>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/50 rounded-lg text-brand-600 dark:text-brand-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{t.theory}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentDay.content}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  {t.example}
                </h3>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-sm overflow-x-auto border border-slate-800">
                  <code>{currentDay.example}</code>
                </pre>
              </div>

              <div className="p-6 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-brand-700 dark:text-brand-400">
                  <Code className="w-5 h-5" />
                  {t.task}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {currentDay.task}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 p-6 lg:p-10 flex flex-col">
          <div className="flex-1 min-h-[400px]">
            <CodeEditor 
              initialCode={currentDay.example}
              expectedOutput={currentDay.expectedOutput}
              onSuccess={handleComplete}
              language={course.id === 'python' ? 'python' : 'html'}
            />
          </div>

          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-full">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Lesson Complete!</h3>
                    <p className="text-white/80">You've earned 10 points and kept your streak alive.</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/")}
                  className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  NEXT STEP
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AITutor 
        courseName={course.name}
        dayNumber={currentDay.day}
        lessonContent={currentDay.content}
        userCode=""
      />
    </div>
  );
}
