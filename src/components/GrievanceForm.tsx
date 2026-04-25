"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GrievanceForm({ username }: { username: string }) {
  const [type, setType] = useState("Grievance");
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  const startLiveRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support voice recognition. Please use Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopLiveRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.text) {
        setDescription(prev => prev + (prev ? ' ' : '') + data.text);
      } else {
        alert("Transcription failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error uploading file.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAudioClick = () => {
    if (isRecording) {
      stopLiveRecording();
    } else {
      // Show a choice or just default to live recording?
      // I'll make the main button live recording, and add a small link for file upload.
      startLiveRecording();
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return alert("Please provide a description!");
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description,
          requestor: username,
          raisedBy: username,
          state: 'MH',
          district: 'Pune',
          village: 'Demo Village'
        }),
      });

      if (response.ok) {
        router.refresh(); 
        setDescription("");
        alert("Grievance submitted successfully!");
      }
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
        >
          <option>Application</option>
          <option>Grievance</option>
          <option>Request</option>
        </select>
      </div>
      
      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Voice-to-Text 🎤</label>
        <div 
          onClick={handleAudioClick}
          className={`p-6 bg-slate-800/30 border-2 border-dashed rounded-2xl text-center hover:bg-slate-800/50 transition-all group cursor-pointer ${isRecording || isTranscribing ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-slate-700 hover:border-indigo-400'}`}
        >
          <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
            {isRecording || isTranscribing ? '⌛' : '🎙️'}
          </div>
          <p className="text-xs text-white font-bold uppercase tracking-widest">
            {isRecording ? 'Listening... (Click to Stop)' : (isTranscribing ? 'Processing File...' : 'Start Live Recording')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Speak clearly or upload a file below</p>
        </div>
        
        <div className="mt-3 text-center">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
          >
            📁 Upload Audio File Instead
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            accept="audio/*" 
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Details</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Your transcribed text will appear here..."
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-slate-600"
        ></textarea>
      </div>

      <button 
        type="button"
        disabled={isSubmitting || isRecording}
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 py-4 rounded-xl font-black text-white shadow-xl shadow-indigo-900/40 active:scale-[0.98] transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT NOW'}
      </button>
    </form>
  );
}
