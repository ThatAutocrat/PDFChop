"use client";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function ToolLayout({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-yellow-400 flex items-center justify-center">
            <FileText className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">PDFChop</span>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All tools
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/40">{desc}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
