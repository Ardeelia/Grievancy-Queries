"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GrievanceForm({ username }: { username: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState("");
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
        // Show the current session's text in the bar live
        setFullTranscript(prev => {
          const parts = prev.split('; ');
          const base = parts.length > 1 ? parts.slice(0, -1).join('; ') + '; ' : "";
          return base + interimTranscript;
        });
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone error. Please refresh and allow access.");
    }
  };

  const handleAction = async (mode: 'pause' | 'new') => {
    if (!isRecording) return alert("Record something first!");

    setIsProcessing(true);
    
    // Stop everything
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    
    // Get the final text from the bar
    const finalNote = fullTranscript.split('; ').pop() || "";

    // Send to backend
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          username,
          text: finalNote,
          type: 'Grievance',
        }),
      });

      if (response.ok) {
        router.refresh();
        if (mode === 'new') {
          setFullTranscript("");
          alert("✅ New record created!");
        } else {
          setFullTranscript(prev => prev + "; ");
          alert("➕ Note added!");
        }
      }
    } catch (e) {
      alert("Error saving.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Voice Control 🎤</label>
        <div 
          onClick={isRecording ? () => {} : startRecording}
          className={`p-10 border-4 border-dashed rounded-3xl text-center transition-all cursor-pointer group ${isRecording ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-indigo-500'}`}
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            {isRecording ? '📡' : '🎙️'}
          </div>
          <p className="text-sm font-black text-white uppercase tracking-tighter">
            {isRecording ? 'Listening Live...' : 'Click to Record Voice'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
        <textarea 
          value={fullTranscript}
          readOnly
          placeholder="Your transcribed text will appear here..."
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 min-h-[200px] text-slate-100 text-sm leading-relaxed font-medium focus:border-indigo-500 outline-none shadow-inner resize-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleAction('pause')}
          disabled={!isRecording || isProcessing}
          className="flex flex-col items-center justify-center p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-amber-500/50 hover:bg-slate-700 transition-all disabled:opacity-30 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⏸</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Pause & Add Note</span>
        </button>

        <button 
          onClick={() => handleAction('new')}
          disabled={!isRecording || isProcessing}
          className="flex flex-col items-center justify-center p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 transition-all disabled:opacity-30 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🆕</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Submit & New</span>
        </button>
      </div>
    </div>
  );
}
