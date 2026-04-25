import { getGrievances, getUserSubmissionCount } from "@/lib/data-manager";
import Link from "next/link";
import GrievanceForm from "@/components/GrievanceForm";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; user?: string }>;
}) {
  const params = await searchParams;
  const role = params.role || 'individual';
  const username = params.user || 'anonymous';
  
  const grievances = getGrievances();
  const userCount = getUserSubmissionCount(username);
  
  const limit = role === 'head' ? 5 : (role === 'admin' ? Infinity : 1);
  const remaining = limit - userCount;
  const canSubmit = remaining > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Welcome, {username}</h1>
          <p className="text-slate-400 capitalize">Role: {role}</p>
        </div>
        <Link href="/" className="text-sm text-indigo-400 hover:underline">← Back to Home</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Panel - Hidden for Admin */}
        {role !== 'admin' && (
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24 shadow-2xl shadow-black/50">
              <h2 className="text-xl font-extrabold mb-6 text-white flex items-center gap-2">
                <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📝</span> New Grievance
              </h2>
              
              <div className="mb-6 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-300 font-medium">Submission Limit</span>
                  <span className="text-white font-black bg-indigo-500 px-2 py-0.5 rounded text-xs leading-none flex items-center">{userCount} / {limit}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-700 ease-out" 
                    style={{ width: `${Math.min((userCount / limit) * 100, 100)}%` }}
                  ></div>
                </div>
                {remaining <= 0 ? (
                  <p className="text-[11px] text-rose-400 mt-3 font-bold flex items-center gap-1">
                    <span>⚠️</span> Limit reached.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-300 mt-3 font-medium">
                    You can submit <span className="text-white underline">{remaining}</span> more grievance{remaining > 1 ? 's' : ''}.
                  </p>
                )}
              </div>

              {canSubmit ? (
                <GrievanceForm username={username} />
              ) : (
                <div className="text-center py-12 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                  <div className="text-5xl mb-4">🔒</div>
                  <p className="text-sm font-black text-white">Form Locked</p>
                  <p className="text-[10px] mt-2 text-slate-400 px-6 leading-relaxed uppercase tracking-tighter font-bold">Limit of {limit} submission{limit > 1 ? 's' : ''} reached for this account.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* List Panel */}
        <div className={role === 'admin' ? 'lg:col-span-3' : 'lg:col-span-2'}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-3">
              <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📋</span> 
              {role === 'admin' ? 'System Records' : 'Your Submissions'}
              <span className="text-xs font-medium text-slate-500 ml-auto bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Total: {(role === 'admin' ? grievances : grievances.filter(g => g.Raised_By === username)).length}</span>
            </h2>
            
            <div className={role === 'admin' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {(role === 'admin' ? grievances : grievances.filter(g => g.Raised_By === username)).map((g, i) => (
                <Link key={i} href={`/grievance/${g.Case_ID}`} className="block">
                  <div className="p-6 bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/20 transition-all rounded-2xl group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black tracking-tighter text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 uppercase">CASE #{g.Case_ID}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{g.Date}</span>
                    </div>
                    <h4 className="font-extrabold text-white text-lg mb-2 leading-tight group-hover:text-indigo-300 transition-colors line-clamp-1">{g.Description.split(';')[0]}</h4>
                    <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><span className="text-indigo-500">📍</span> {g.Village_ID}</span>
                      <span className="flex items-center gap-1"><span className="text-indigo-500">👤</span> {g.Requestor_Details}</span>
                      {g.Description.includes(';') && <span className="text-indigo-400 bg-indigo-500/5 px-2 rounded-md border border-indigo-500/10 text-[9px]">+ Multiple Notes</span>}
                    </div>
                    {role === 'admin' && (
                      <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[11px] text-indigo-400 font-black uppercase tracking-tighter">Raised By: {g.Raised_By}</span>
                        <span className="text-[10px] font-black text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 uppercase tracking-widest bg-slate-800 group-hover:bg-indigo-600">View File</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              
              {grievances.length === 0 && (
                <div className="text-center py-20 text-slate-500 italic text-sm">
                  No grievances found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
