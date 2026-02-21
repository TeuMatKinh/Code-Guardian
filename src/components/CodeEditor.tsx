import { useState } from "react";
import { useAuth } from "../App";
import { Play, CheckCircle, AlertCircle } from "lucide-react";

interface CodeEditorProps {
  initialCode: string;
  expectedOutput: string;
  onSuccess: () => void;
  language: string;
}

export default function CodeEditor({ initialCode, expectedOutput, onSuccess, language }: CodeEditorProps) {
  const { t } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState("");

  const runCode = () => {
    try {
      const regex = new RegExp(expectedOutput, 'i');
      if (regex.test(code)) {
        setStatus('success');
        setFeedback("Great job! You solved it.");
        onSuccess();
      } else {
        setStatus('error');
        setFeedback("Not quite right. Check your code and try again.");
      }
    } catch (e) {
      setStatus('error');
      setFeedback("Error checking your code.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      {/* Toolbar */}
      <div className="h-12 bg-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-4 uppercase">{language} Editor</span>
        </div>
        <button
          onClick={runCode}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
        >
          <Play className="w-3 h-3" />
          {t.submit}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent text-slate-100 font-mono text-sm p-4 resize-none outline-none"
          spellCheck={false}
        />
      </div>

      {/* Feedback */}
      {status !== 'idle' && (
        <div className={`p-4 border-t ${
          status === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}
