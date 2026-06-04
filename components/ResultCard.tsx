"use client";
import { CheckCircle2, Download } from "lucide-react";

interface ResultCardProps {
  label: string;
  onDownload: () => void;
  extra?: string;
}

export default function ResultCard({ label, onDownload, extra }: ResultCardProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-green-500/5 border border-green-500/20 mt-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          {extra && <p className="text-white/40 text-xs">{extra}</p>}
        </div>
      </div>
      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Download
      </button>
    </div>
  );
}
