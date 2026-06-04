"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { imagesToPDF, downloadFile, formatBytes } from "@/lib/pdf-utils";
import { X } from "lucide-react";

export default function ImagesToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const onFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...valid]);
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
    setResult(null);
  }, []);

  const remove = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const run = async () => {
    if (files.length === 0) return setError("Add at least one image.");
    setError("");
    setLoading(true);
    try {
      const out = await imagesToPDF(files);
      setResult(out);
    } catch {
      setError("Failed to convert. Check your image files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Images to PDF" desc="Convert JPG and PNG images into a single PDF document.">
      <div className="space-y-6">
        <DropZone
          onFiles={onFiles}
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
          multiple
          files={[]}
          label="Drop images here (JPG, PNG, WebP)"
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 group">
                <img src={src} alt={files[i]?.name} className="w-full object-cover aspect-square" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => remove(i)}
                    className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60">
                  <span className="text-white/50 text-xs truncate block">{files[i]?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <ActionButton
          onClick={run}
          loading={loading}
          disabled={files.length === 0}
          label={files.length > 0 ? `Convert ${files.length} image${files.length > 1 ? "s" : ""} to PDF` : "Add images to convert"}
        />

        {result && (
          <ResultCard
            label="images.pdf is ready"
            extra={formatBytes(result.byteLength)}
            onDownload={() => downloadFile(result, "images.pdf")}
          />
        )}
      </div>
    </ToolLayout>
  );
}
