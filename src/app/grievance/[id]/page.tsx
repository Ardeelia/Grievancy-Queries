import { getGrievances } from "@/lib/data-manager";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GrievanceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grievances = getGrievances();
  const grievance = grievances.find((g) => g.Case_ID === id);

  if (!grievance) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/dashboard" className="text-indigo-400 hover:underline mb-8 inline-block text-sm">← Back to Dashboard</Link>
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-widest mb-4 inline-block">Case File #{grievance.Case_ID}</span>
            <h1 className="text-4xl font-black text-white leading-tight mt-2">{grievance.Description.split(';')[0]}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dated</p>
            <p className="text-lg font-black text-white">{grievance.Date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Village</p>
            <p className="text-sm font-black text-white">{grievance.Village_ID}</p>
          </div>
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Requestor</p>
            <p className="text-sm font-black text-white">{grievance.Requestor_Details}</p>
          </div>
          <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</p>
            <p className="text-sm font-black text-white">{grievance.Type}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-white border-b border-slate-800 pb-4">Full Transcription Details</h2>
          <div className="space-y-4">
            {grievance.Description.split(';').map((segment, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                  {i < grievance.Description.split(';').length - 1 && <div className="w-0.5 h-full bg-slate-800"></div>}
                </div>
                <div className="pb-8">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Transcription Note {i + 1}</p>
                  <p className="text-slate-300 leading-relaxed text-lg">{segment.trim()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              {grievance.Raised_By[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified By</p>
              <p className="text-sm font-black text-white">{grievance.Raised_By}</p>
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40 active:scale-95">Verify Case</button>
        </div>
      </div>
    </div>
  );
}
