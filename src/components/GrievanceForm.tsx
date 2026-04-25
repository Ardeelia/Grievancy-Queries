"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GrievanceForm({ username }: { username: string }) {
  const [type, setType] = useState("Grievance");
  const [description, setDescription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAudioClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    
    // Simulate AI Transcription
    setTimeout(() => {
      const mockTranscriptions = [
        "The water supply in our sector has been interrupted for three days. Please investigate.",
        "Requesting a new street light near the village entrance for safety.",
        "The primary school roof needs urgent repairs before the monsoon season.",
        "Found some issues with the drainage system near the main road."
      ];
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setDescription(prev => prev ? `${prev}\n\n[Transcribed]: ${randomText}` : randomText);
      setIsTranscribing(false);
    }, 2000);
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
        router.refresh(); // Refresh the server component data
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
        <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Voice Note 🎤</label>
        <div 
          onClick={handleAudioClick}
          className={`p-6 bg-slate-800/30 border-2 border-dashed rounded-2xl text-center hover:bg-slate-800/50 transition-all group cursor-pointer ${isTranscribing ? 'border-indigo-500 animate-pulse' : 'border-slate-700 hover:border-indigo-400'}`}
        >
          <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
            {isTranscribing ? '⌛' : '🎙️'}
          </div>
          <p className="text-xs text-white font-bold">
            {isTranscribing ? 'Transcribing with AI...' : 'Record / Upload Audio'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Click to trigger transcription</p>
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
          placeholder="Describe your issue here..."
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-slate-600"
        ></textarea>
      </div>

      <button 
        type="button"
        disabled={isSubmitting || isTranscribing}
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 py-4 rounded-xl font-black text-white shadow-xl shadow-indigo-900/40 active:scale-[0.98] transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT NOW'}
      </button>
    </form>
  );
}
