"use client";

import { useRouter } from "next/navigation";

export default function DemoButtons() {
  const router = useRouter();

  const handleDemoLogin = (role: string, username: string) => {
    // We'll use searchParams to simulate the login role for this demo
    // In a real app, this would be handled by Clerk metadata or a session
    router.push(`/dashboard?role=${role}&user=${username}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button 
        onClick={() => handleDemoLogin('admin', 'demo_admin')}
        className="bg-slate-800 hover:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 border border-slate-700"
      >
        👨‍💼 Admin
      </button>
      <button 
        onClick={() => handleDemoLogin('head', 'demo_head')}
        className="bg-slate-800 hover:bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 border border-slate-700"
      >
        👳 Panchayat
      </button>
      <button 
        onClick={() => handleDemoLogin('individual', 'demo_citizen')}
        className="bg-slate-800 hover:bg-pink-600 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 border border-slate-700"
      >
        👤 Citizen
      </button>
    </div>
  );
}
