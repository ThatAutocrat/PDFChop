"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageStripProps {
  thumbs: string[];
  currentPage: number;
  totalPages: number;
  onPage: (i: number) => void;
}

export default function PageStrip({ thumbs, currentPage, totalPages, onPage }: PageStripProps) {
  return (
    <div className="w-24 flex-shrink-0 border-r border-white/5 overflow-y-auto flex flex-col gap-2 p-2 bg-[hsl(0_0%_5%)]">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPage(i)}
          className={cn(
            "relative rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
            currentPage === i
              ? "border-yellow-400"
              : "border-white/10 hover:border-white/30"
          )}
        >
          {thumbs[i] ? (
            <img src={thumbs[i]} alt={`Page ${i + 1}`} className="w-full" />
          ) : (
            <div className="aspect-[3/4] flex items-center justify-center bg-white/2">
              <Loader2 className="w-3 h-3 text-white/20 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 py-0.5 bg-black/60 text-center">
            <span className="text-white/40 text-[10px] font-mono">{i + 1}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
