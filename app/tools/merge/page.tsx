"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { mergePDFs, downloadFile, formatBytes } from "@/lib/pdf-utils";
import { X, GripVertical } from "lucide-react";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const onFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
    setResult(null);
  }, []);

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const run = async () => {
    if (files.length < 2) return setError("Add at least 2 PDFs to merge.");
    setError("");
    setLoading(true);
    try {
      const out = await mergePDFs(files);
      setResult(out);
    } catch {
      setError("Something went wrong. Make sure all files are valid PDFs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Merge PDFs" desc="Combine multiple PDF files into a single document. Drag to reorder.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} multiple label="Drop PDFs here (add as many as you need)" files={[]} />

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest">Order — {files.length} files</p>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <GripVertical className="w-4 h-4 text-white/20" />
                <span className="text-white/20 text-xs font-mono w-5">{i + 1}</span>
                <span className="text-white/70 text-sm truncate flex-1">{f.name}</span>
                <span className="text-white/25 text-xs font-mono">{formatBytes(f.size)}</span>
                <button onClick={() => remove(i)} className="text-white/20 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <ActionButton onClick={run} loading={loading} disabled={files.length < 2} label={`Merge ${files.length} PDFs`} />

        {result && (
          <ResultCard
            label="merged.pdf is ready"
            extra={`${formatBytes(result.byteLength)}`}
            onDownload={() => downloadFile(result, "merged.pdf")}
          />
        )}
      </div>
    </ToolLayout>
  );
}
