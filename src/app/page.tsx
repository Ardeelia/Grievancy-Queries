import { auth } from "@clerk/nextjs/server";
import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import DemoButtons from "@/components/DemoButtons";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* INSTANT DEMO SECTION (As before) */}
          <div className="mb-12 inline-block p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <div className="bg-slate-900/90 backdrop-blur-xl px-8 py-6 rounded-[calc(1rem-1px)]">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">🚀 Instant Demo Access</h3>
              <DemoButtons />
              <p className="text-[10px] text-slate-500 mt-3 italic">No login required for demo mode</p>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Your Voice <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Matters</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report grievances and track applications on a secure, grandiose platform. 
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">Sign In to Start</SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95">
                Go to Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🎤"
            title="Voice Submissions"
            description="Speak your mind. Our AI transcribes your voice notes automatically."
          />
          <FeatureCard 
            icon="🔒"
            title="Secure Access"
            description="Enterprise-grade security powered by Clerk."
          />
          <FeatureCard 
            icon="📊"
            title="Real-time Tracking"
            description="Monitor progress and get updates instantly."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-colors group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
