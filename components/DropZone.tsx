"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/pdf-utils";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  files?: File[];
  label?: string;
}

export default function DropZone({
  onFiles,
  accept = { "application/pdf": [".pdf"] },
  multiple = false,
  files = [],
  label = "Drop your PDF here",
}: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer transition-all",
          isDragActive && "drop-zone-active"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/60 text-sm font-medium">{label}</p>
        <p className="text-white/25 text-xs mt-1">or click to browse</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <File className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-white/70 text-sm truncate flex-1">{f.name}</span>
              <span className="text-white/25 text-xs font-mono flex-shrink-0">{formatBytes(f.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
