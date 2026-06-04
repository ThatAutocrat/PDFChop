"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { compressPDF, downloadFile, formatBytes } from "@/lib/pdf-utils";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const onFiles = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError("");
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const out = await compressPDF(file);
      setResult(out);
    } catch {
      setError("Failed to compress. Make sure the file is a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  const savings = result && file ? Math.max(0, Math.round((1 - result.byteLength / file.size) * 100)) : 0;

  return (
    <ToolLayout title="Compress PDF" desc="Reduce your PDF file size using lossless compression. No quality loss.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to compress" />

        {file && (
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between">
            <span className="text-white/40 text-sm">Original size</span>
            <span className="text-white font-mono text-sm">{formatBytes(file.size)}</span>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <ActionButton onClick={run} loading={loading} disabled={!file} label="Compress PDF" />

        {result && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Original", value: formatBytes(file!.size) },
                { label: "Compressed", value: formatBytes(result.byteLength) },
                { label: "Saved", value: `${savings}%` },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-white/30 text-xs mb-1">{label}</p>
                  <p className={`font-mono font-bold text-lg ${label === "Saved" ? "text-green-400" : "text-white"}`}>{value}</p>
                </div>
              ))}
            </div>
            <ResultCard
              label="compressed.pdf is ready"
              extra={savings > 0 ? `${savings}% smaller` : "Already optimized"}
              onDownload={() => downloadFile(result, "compressed.pdf")}
            />
          </>
        )}
      </div>
    </ToolLayout>
  );
}
