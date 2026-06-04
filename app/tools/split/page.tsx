"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import { splitPDF, getPDFPageCount, downloadFile } from "@/lib/pdf-utils";
import { CheckCircle2, Download } from "lucide-react";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"extract" | "each">("extract");
  const [rangeInput, setRangeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ data: Uint8Array; name: string }[]>([]);
  const [error, setError] = useState("");

  const onFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResults([]);
    setError("");
    const count = await getPDFPageCount(f);
    setPageCount(count);
  };

  const parseRanges = (input: string): number[][] => {
    return input.split(",").map((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
      }
      return [Number(trimmed) - 1];
    });
  };

  const run = async () => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      let ranges: number[][];
      if (mode === "each") {
        ranges = Array.from({ length: pageCount }, (_, i) => [i]);
      } else {
        if (!rangeInput.trim()) {
          setError("Enter page ranges like: 1-3, 4, 5-7");
          setLoading(false);
          return;
        }
        ranges = parseRanges(rangeInput);
      }
      const outputs = await splitPDF(file, ranges);
      setResults(outputs.map((data, i) => ({ data, name: `split-part-${i + 1}.pdf` })));
    } catch {
      setError("Failed to split. Check your page ranges.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Split PDF" desc="Extract specific pages or split every page into individual files.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to split" />

        {pageCount > 0 && (
          <div className="space-y-4">
            <p className="text-white/40 text-sm">
              <span className="text-yellow-400 font-mono">{pageCount}</span> pages detected
            </p>
            <div className="flex gap-3">
              {(["extract", "each"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {m === "extract" ? "Extract ranges" : "Every page separately"}
                </button>
              ))}
            </div>
            {mode === "extract" && (
              <div>
                <label className="text-white/40 text-xs block mb-2">
                  Page ranges (e.g. <span className="font-mono text-yellow-400">1-3, 4, 5-7</span>)
                </label>
                <input
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="1-3, 4, 5-7"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400/50 font-mono placeholder:text-white/20"
                />
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <ActionButton onClick={run} loading={loading} disabled={!file} label="Split PDF" />

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest">{results.length} files ready</p>
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-white/70 text-sm">{r.name}</span>
                </div>
                <button
                  onClick={() => downloadFile(r.data, r.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
