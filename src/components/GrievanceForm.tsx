"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GrievanceForm({ 
  username, 
  sessionId, 
  onComplete 
}: { 
  username: string, 
  sessionId: string,
  onComplete?: (updatedList: any[]) => void
}) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'followup' | 'success'>('idle');
  const [fullTranscript, setFullTranscript] = useState("");
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [contextText, setContextText] = useState(""); // For context passing

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      return alert("Please use Chrome for voice features.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.start();

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interimTranscript += event.results[i][0].transcript;
        }
        setFullTranscript(prev => {
          const parts = prev.split('; ');
          const base = parts.length > 1 ? parts.slice(0, -1).join('; ') + '; ' : "";
          return base + interimTranscript;
        });
      };

      recognitionRef.current.start();
      setStatus('recording');
    } catch (err) {
      alert("Microphone error. Please refresh and allow access.");
    }
  };

  const handleAction = async (mode: 'pause' | 'new') => {
    if (status !== 'recording') return;

    setStatus('processing');
    
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    
    // Get current text
    const currentText = fullTranscript.split('; ').pop() || "";
    const fullContext = contextText ? `${contextText} | User Answer: ${currentText}` : currentText;

    // Create FormData as per requirement
    const formData = new FormData();
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('mode', mode);
    formData.append('username', username);
    formData.append('sessionId', sessionId);
    formData.append('context', fullContext);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData, // Send as FormData
      });

      const data = await response.json();

      if (data.status === 'needs_followup') {
        setFollowupQuestion(data.native_question);
        setContextText(fullContext); // Store for next turn
        setStatus('followup');
        // Optional: Speak aloud using TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.native_question);
          window.speechSynthesis.speak(utterance);
        }
      } else if (data.status === 'success' || data.success) {
        if (onComplete) onComplete(data.grievances || []);
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setFullTranscript("");
          setContextText("");
        }, 3000);
      }
    } catch (e) {
      alert("Error saving.");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="text-7xl mb-4">✅</div>
        <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest">Case Submitted!</h2>
        <p className="text-xs text-emerald-500/70 mt-2 font-bold uppercase tracking-tighter">Your report has been logged successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status === 'followup' && (
        <div className="bg-amber-500/10 border-2 border-amber-500 rounded-3xl p-6 animate-in slide-in-from-top duration-500">
          <label className="block text-[10px] font-black text-amber-500 uppercase mb-2 tracking-widest">Databricks Follow-up Question 🤖</label>
          <p className="text-white font-black text-lg leading-tight">{followupQuestion}</p>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">
          {status === 'followup' ? 'Record Your Answer 🎤' : 'Voice Control 🎤'}
        </label>
        <div 
          onClick={status === 'recording' ? () => {} : startRecording}
          className={`p-10 border-4 border-dashed rounded-3xl text-center transition-all cursor-pointer group ${status === 'recording' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-indigo-500'}`}
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            {status === 'recording' ? '📡' : '🎙️'}
          </div>
          <p className="text-sm font-black text-white uppercase tracking-tighter">
            {status === 'recording' ? 'Listening Live...' : (status === 'followup' ? 'Click to Record Answer' : 'Click to Start Report')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Transcript</label>
        <textarea 
          value={fullTranscript}
          readOnly
          placeholder="Transcription appears here..."
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 min-h-[150px] text-slate-100 text-sm leading-relaxed font-medium focus:border-indigo-500 outline-none shadow-inner resize-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleAction('pause')}
          disabled={status !== 'recording' || status === 'processing'}
          className="flex flex-col items-center justify-center p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-amber-500/50 hover:bg-slate-700 transition-all disabled:opacity-20 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⏸</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Pause & Add</span>
        </button>

        <button 
          onClick={() => handleAction('new')}
          disabled={status !== 'recording' || status === 'processing'}
          className="flex flex-col items-center justify-center p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 transition-all disabled:opacity-20 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🆕</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Submit Final</span>
        </button>
      </div>

      {status === 'processing' && (
        <div className="text-center py-2 animate-pulse">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Databricks is thinking...</p>
        </div>
      )}
    </div>
  );
}
