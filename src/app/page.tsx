import { auth } from "@clerk/nextjs/server";
import { Show } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Your Voice <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Matters</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report grievances, track applications, and engage with your community. 
            A modern, secure, and grandiose platform for citizen empowerment.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-up" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95">
                Start Submitting
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95">
                Go to Dashboard
              </Link>
            </Show>
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-8 py-4 rounded-full text-lg font-bold transition-all hover:-translate-y-1 active:scale-95">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🎤"
            title="Voice Submissions"
            description="Speak your mind. Our AI automatically transcribes your voice notes into official grievances."
          />
          <FeatureCard 
            icon="🔒"
            title="Secure with Clerk"
            description="Your identity and data are protected by world-class authentication and encryption."
          />
          <FeatureCard 
            icon="📊"
            title="Real-time Tracking"
            description="Monitor the progress of your requests and get instant updates from panchayat heads."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2026 Grievance Portal. All rights reserved. Built for community impact.
        </div>
      </footer>
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
