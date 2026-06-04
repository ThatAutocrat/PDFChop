"use client";
import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import DropZone from "@/components/DropZone";
import ActionButton from "@/components/ActionButton";
import ResultCard from "@/components/ResultCard";
import { reorderPDF, renderPDFPage, getPDFPageCount, downloadFile, formatBytes } from "@/lib/pdf-utils";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";

function SortableCard({ id, index, thumb }: { id: string; index: number; thumb: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="relative rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {thumb ? (
        <img src={thumb} alt={`Page ${index + 1}`} className="w-full object-cover" />
      ) : (
        <div className="aspect-[3/4] flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/60 flex items-center justify-between">
        <span className="text-white/60 text-xs font-mono">pg {index + 1}</span>
        <GripVertical className="w-3.5 h-3.5 text-white/30" />
      </div>
    </div>
  );
}

export default function ReorderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setRendering(true);
    const count = await getPDFPageCount(f);
    setOrder(Array.from({ length: count }, (_, i) => i));
    const rendered: string[] = [];
    for (let i = 1; i <= count; i++) {
      const thumb = await renderPDFPage(f, i);
      rendered.push(thumb);
      setThumbs([...rendered]);
    }
    setRendering(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIdx = prev.indexOf(Number(active.id));
        const newIdx = prev.indexOf(Number(over.id));
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const out = await reorderPDF(file, order);
      setResult(out);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="Reorder Pages" desc="Drag and drop pages to rearrange them in any order.">
      <div className="space-y-6">
        <DropZone onFiles={onFiles} files={file ? [file] : []} label="Drop a PDF to reorder its pages" />

        {rendering && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Rendering page previews...
          </div>
        )}

        {order.length > 0 && thumbs.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order.map(String)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {order.map((pageIdx, i) => (
                  <SortableCard key={pageIdx} id={String(pageIdx)} index={i} thumb={thumbs[pageIdx] || ""} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <ActionButton onClick={run} loading={loading} disabled={!file || order.length === 0} label="Save New Order" />

        {result && (
          <ResultCard
            label="reordered.pdf is ready"
            extra={formatBytes(result.byteLength)}
            onDownload={() => downloadFile(result, "reordered.pdf")}
          />
        )}
      </div>
    </ToolLayout>
  );
}
