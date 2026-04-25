"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import GrievanceForm from "@/components/GrievanceForm";

export default function DashboardClient({ 
  role, 
  username, 
  initialGrievances 
}: { 
  role: string, 
  username: string, 
  initialGrievances: any[] 
}) {
  const [sessionId, setSessionId] = useState<string>("");
  const [grievances, setGrievances] = useState(initialGrievances);

  // Generate a NEW session ID only on the client to avoid hydration errors
  useEffect(() => {
    setSessionId(Date.now().toString());
  }, []);

  // Filter grievances based on the fresh sessionId
  const sessionGrievances = useMemo(() => {
    if (role === 'admin') return grievances;
    return grievances.filter(g => g.Session_ID === sessionId && g.Raised_By === username);
  }, [grievances, sessionId, role, username]);

  const limit = role === 'head' ? 5 : (role === 'admin' ? Infinity : 1);
  const userCount = sessionGrievances.length; 
  const remaining = limit - userCount;
  const canSubmit = remaining > 0;

  // Handle direct updates from the form
  const handleUpdate = (updatedList: any[]) => {
    setGrievances(updatedList);
  };

  if (!sessionId) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-indigo-500 animate-pulse uppercase tracking-widest">Initializing Session...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white leading-tight">Welcome, {username}</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Role: <span className="text-indigo-400">{role}</span></p>
        </div>
        <Link href="/" className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">← Back to Portal Home</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {role !== 'admin' && (
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sticky top-24 shadow-2xl shadow-black/50">
              <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2">
                <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 text-lg">🎙️</span> New Voice Report
              </h2>
              
              <div className="mb-6 p-5 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Current Session Progress</span>
                  <span className="text-white bg-indigo-600 px-3 py-1 rounded-full">{userCount} / {limit}</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${Math.min((userCount / limit) * 100, 100)}%` }}
                  ></div>
                </div>
                {remaining <= 0 ? (
                  <p className="text-[10px] text-rose-400 mt-3 font-black uppercase tracking-tighter flex items-center gap-1">
                    <span>🚫</span> Session Limit Reached.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tighter">
                    You can record <span className="text-white underline">{remaining}</span> more segment{remaining > 1 ? 's' : ''}.
                  </p>
                )}
              </div>

              {canSubmit ? (
                <GrievanceForm username={username} sessionId={sessionId} onComplete={handleUpdate} />
              ) : (
                <div className="text-center py-12 bg-slate-950/30 rounded-2xl border-2 border-slate-800/50">
                  <div className="text-6xl mb-4 animate-bounce">🔒</div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">Limit Met</p>
                  <p className="text-[9px] mt-2 text-slate-500 px-6 leading-relaxed uppercase tracking-widest">The form is locked for this session. Refresh to restart.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={role === 'admin' ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 min-h-[600px]">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 text-lg">📁</span> 
                {role === 'admin' ? 'Global Master Records' : 'Current Session Logs'}
              </h2>
              <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-4 py-2 rounded-full border-2 border-slate-700 uppercase tracking-widest">Count: {sessionGrievances.length}</span>
            </div>
            
            <div className={role === 'admin' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-5'}>
              {sessionGrievances.map((g, i) => (
                <Link key={i} href={`/grievance/${g.Case_ID}`} className="block transform hover:-translate-y-1 transition-all">
                  <div className="p-7 bg-slate-950/40 border-2 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/30 transition-all rounded-3xl group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase">CASE #{g.Case_ID}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{g.Date}</span>
                    </div>
                    <h4 className="font-black text-white text-xl mb-3 leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">{g.Description.split(';')[0]}</h4>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg"><span className="text-indigo-500 text-sm">📍</span> {g.Village_ID}</span>
                      <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg"><span className="text-indigo-500 text-sm">👤</span> {g.Requestor_Details}</span>
                      {g.Description.includes(';') && <span className="text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">+ Notes Included</span>}
                    </div>
                  </div>
                </Link>
              ))}
              
              {sessionGrievances.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-800 rounded-3xl">
                  <div className="text-6xl mb-6 opacity-30 grayscale">📂</div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Zero Records in Current Session</p>
                  <p className="text-[9px] text-slate-700 mt-2 uppercase font-bold tracking-widest">Submit a voice report to populate logs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
