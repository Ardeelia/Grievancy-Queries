"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GrievanceForm({ username }: { username: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscription, setLastTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const pendingModeRef = useRef<'pause' | 'new' | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (pendingModeRef.current) {
          handleSubmission(audioBlob, pendingModeRef.current);
          pendingModeRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmission = async (blob: Blob, mode: 'pause' | 'new') => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('mode', mode);
    formData.append('username', username);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setLastTranscription(data.text);
        router.refresh();
        if (mode === 'new') alert("New grievance created!");
        else alert("Note added to current grievance with semicolon (;)");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Submission failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerAction = (mode: 'pause' | 'new') => {
    if (isRecording) {
      pendingModeRef.current = mode;
      stopRecording();
    } else {
      alert("Click the microphone to record your voice first!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">Voice Control 🎤</label>
        
        <div 
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-10 border-4 border-dashed rounded-3xl text-center transition-all cursor-pointer group ${isRecording ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-slate-700 bg-slate-800/30 hover:border-indigo-500'}`}
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
            {isRecording ? '🛑' : '🎙️'}
          </div>
          <p className="text-sm font-black text-white uppercase tracking-tighter">
            {isRecording ? 'Recording Now... Click to Finish' : 'Click to Record Voice'}
          </p>
        </div>
      </div>

      {lastTranscription && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Last Transcribed Text:</p>
          <p className="text-xs text-white italic">"{lastTranscription}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => triggerAction('pause')}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-amber-500/50 hover:bg-slate-700 transition-all disabled:opacity-50 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⏸</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Pause & Add Note</span>
          <span className="text-[8px] text-slate-500 mt-1">(Adds ; to current)</span>
        </button>

        <button 
          onClick={() => triggerAction('new')}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 transition-all disabled:opacity-50 group"
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🆕</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Submit & New</span>
          <span className="text-[8px] text-indigo-200 mt-1">(Create new record)</span>
        </button>
      </div>

      {isProcessing && (
        <div className="text-center py-2 animate-bounce">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Processing Audio...</p>
        </div>
      )}
    </div>
  );
}
