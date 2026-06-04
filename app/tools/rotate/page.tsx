"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { rotatePDF, renderPDFPage, getPDFPageCount, downloadFile, formatBytes } from "@/lib/pdf-utils";
import { Loader2, RotateCw, RotateCcw } from "lucide-react";

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setRendering(true);
    const count = await getPDFPageCount(f);
    setRotations(new Array(count).fill(0));
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

  const selectAll = () => setSelected(new Set(thumbs.map((_, i) => i)));

  const applyRotation = (angle: number) => {
    const targets = selected.size > 0 ? Array.from(selected) : thumbs.map((_, i) => i);
    setRotations((prev) => {
      const next = [...prev];
      targets.forEach((i) => { next[i] = (next[i] + angle + 360) % 360; });
      return next;
    });
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const pagesToRotate = rotations.map((r, i) => ({ i, r })).filter(({ r }) => r !== 0);
      if (pagesToRotate.length === 0) return;
      // Apply each unique rotation group
      let currentBytes: ArrayBuffer | null = null;
      for (const deg of [90, 180, 270]) {
        const pages = rotations.map((r, i) => ({ r, i })).filter(({ r }) => r === deg).map(({ i }) => i);
        if (pages.length > 0) {
          const src = currentBytes
            ? new File([currentBytes], "tmp.pdf", { type: "application/pdf" })
            : file;
          const out = await rotatePDF(src, pages, deg);
          currentBytes = out.buffer as ArrayBuffer;
        }
      }
      if (currentBytes) setResult(new Uint8Array(currentBytes));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Rotate Pages" desc="Select pages and rotate them 90° clockwise or counterclockwise.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to rotate its pages" />

        {rendering && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading previews...
          </div>
        )}

        {thumbs.length > 0 && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors">
                Select all
              </button>
              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors">
                Clear
              </button>
              <div className="flex-1" />
              <button onClick={() => applyRotation(-90)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-xs font-medium transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> 90° CCW
              </button>
              <button onClick={() => applyRotation(90)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-xs font-medium transition-colors">
                <RotateCw className="w-3.5 h-3.5" /> 90° CW
              </button>
              <button onClick={() => applyRotation(180)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-xs font-medium transition-colors">
                180°
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {thumbs.map((thumb, i) => (
                <div
                  key={i}
                  onClick={() => toggle(i)}
                  className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                    selected.has(i) ? "border-yellow-400" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="transition-transform duration-300" style={{ transform: `rotate(${rotations[i]}deg)` }}>
                    <img src={thumb} alt={`Page ${i + 1}`} className="w-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 flex justify-between">
                    <span className="text-white/50 text-xs font-mono">pg {i + 1}</span>
                    {rotations[i] !== 0 && <span className="text-yellow-400 text-xs font-mono">{rotations[i]}°</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ActionButton onClick={run} loading={loading} disabled={!file || rotations.every(r => r === 0)} label="Apply Rotations" />

        {result && (
          <ResultCard
            label="rotated.pdf is ready"
            extra={formatBytes(result.byteLength)}
            onDownload={() => downloadFile(result, "rotated.pdf")}
          />
        )}
      </div>
    </ToolLayout>
  );
}
