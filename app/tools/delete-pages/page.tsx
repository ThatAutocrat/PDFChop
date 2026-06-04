"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { deletePages, renderPDFPage, getPDFPageCount, downloadFile, formatBytes } from "@/lib/pdf-utils";
import { Loader2, Trash2 } from "lucide-react";

export default function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const onFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setSelected(new Set());
    setResult(null);
    setRendering(true);
    const count = await getPDFPageCount(f);
    setPageCount(count);
    const rendered: string[] = [];
    for (let i = 1; i <= count; i++) {
      const thumb = await renderPDFPage(f, i);
      rendered.push(thumb);
      setThumbs([...rendered]);
    }
    setRendering(false);
  };

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const run = async () => {
    if (!file || selected.size === 0) return setError("Select at least one page to delete.");
    if (selected.size >= pageCount) return setError("You can't delete all pages.");
    setError("");
    setLoading(true);
    try {
      const out = await deletePages(file, Array.from(selected));
      setResult(out);
    } catch {
      setError("Failed to delete pages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Delete Pages" desc="Click pages to select them, then delete. Preview exactly what you're removing.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to remove pages from" />

        {rendering && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading page previews...
          </div>
        )}

        {thumbs.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-sm">
                Click pages to select for deletion
                {selected.size > 0 && (
                  <span className="ml-2 text-red-400 font-medium">{selected.size} selected</span>
                )}
              </p>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())} className="text-white/30 hover:text-white/60 text-xs">
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {thumbs.map((thumb, i) => (
                <div
                  key={i}
                  onClick={() => toggle(i)}
                  className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                    selected.has(i)
                      ? "border-red-500 opacity-50"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={thumb} alt={`Page ${i + 1}`} className="w-full object-cover" />
                  {selected.has(i) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60">
                    <span className="text-white/50 text-xs font-mono">pg {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <ActionButton
          onClick={run}
          loading={loading}
          disabled={!file || selected.size === 0}
          label={selected.size > 0 ? `Delete ${selected.size} page${selected.size > 1 ? "s" : ""}` : "Select pages to delete"}
        />

        {result && (
          <ResultCard
            label="updated.pdf is ready"
            extra={formatBytes(result.byteLength)}
            onDownload={() => downloadFile(result, "updated.pdf")}
          />
        )}
      </div>
    </ToolLayout>
  );
}
