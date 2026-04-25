import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grievance Portal | Next.js",
  description: "Grandiose Grievance Portal powered by Next.js and Clerk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-slate-950 text-slate-50 min-h-screen">
        <ClerkProvider>
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">G</div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Grievance Portal</span>
              </div>
              <div className="flex items-center gap-4">
                <Show when="signed-out">
                  <div className="flex items-center gap-4">
                    <SignInButton mode="modal"><span className="text-sm font-medium hover:text-indigo-400 transition-colors cursor-pointer text-white">Sign In</span></SignInButton>
                    <SignUpButton mode="modal"><span className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer text-white">Sign Up</span></SignUpButton>
                  </div>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
