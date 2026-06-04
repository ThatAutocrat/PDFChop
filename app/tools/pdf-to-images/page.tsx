"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import { pdfToImages, downloadImage } from "@/lib/pdf-utils";
import { Download, Loader2 } from "lucide-react";

export default function PDFToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const onFiles = (files: File[]) => {
    setFile(files[0]);
    setImages([]);
    setError("");
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const imgs = await pdfToImages(file);
      setImages(imgs);
    } catch {
      setError("Failed to convert. Make sure it's a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    images.forEach((img, i) => downloadImage(img, `page-${i + 1}.png`));
  };

  return (
    <ToolLayout title="PDF to Images" desc="Export each page of your PDF as a high-quality PNG image.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to export as images" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <ActionButton onClick={run} loading={loading} disabled={!file} label="Export as PNG Images" loadingLabel="Exporting pages..." />

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-sm">
                <span className="text-yellow-400 font-mono">{images.length}</span> pages exported
              </p>
              <button
                onClick={downloadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-xl border border-white/10 overflow-hidden group">
                  <img src={img} alt={`Page ${i + 1}`} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(img, `page-${i + 1}.png`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60">
                    <span className="text-white/50 text-xs font-mono">page-{i + 1}.png</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
