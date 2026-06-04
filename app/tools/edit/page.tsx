"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import DropZone from "@/components/DropZone";
import Toolbar from "@/components/editor/Toolbar";
import PageStrip from "@/components/editor/PageStrip";
import CanvasEditor, { CanvasEditorHandle } from "@/components/editor/CanvasEditor";
import { Tool } from "@/components/editor/types";
import { getPDFPageCount, renderPDFPage, downloadFile } from "@/lib/pdf-utils";
import { exportAnnotatedPDF } from "@/lib/pdf-export";

export default function EditPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 });

  // Annotation store: save fabric JSON per page
  const annotationsRef = useRef<Record<number, string>>({});

  // Toolbar state
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#FACC15");
  const [fontSize, setFontSize] = useState(18);
  const [brushSize, setBrushSize] = useState(4);
  const [historyVersion, setHistoryVersion] = useState(0);

  const editorRef = useRef<CanvasEditorHandle>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setCurrentPage(0);
    setThumbs([]);
    setPageImages([]);
    annotationsRef.current = {};
    setLoading(true);

    const count = await getPDFPageCount(f);
    setPageCount(count);

    // Render all pages
    const rendered: string[] = [];
    for (let i = 1; i <= count; i++) {
      const img = await renderPDFPage(f, i);
      rendered.push(img);
      setThumbs([...rendered]);
      setPageImages([...rendered]);
    }

    // Set canvas size from first page
    if (rendered[0]) {
      const image = new Image();
      image.src = rendered[0];
      image.onload = () => {
        const maxW = Math.min(image.width, 860);
        const scale = maxW / image.width;
        setCanvasSize({ width: maxW, height: Math.round(image.height * scale) });
      };
    }

    setLoading(false);
  };

  // Save current page annotations before switching
  const saveCurrentPage = useCallback(() => {
    if (editorRef.current) {
      annotationsRef.current[currentPage] = editorRef.current.getJSON();
    }
  }, [currentPage]);

  const goToPage = useCallback((idx: number) => {
    saveCurrentPage();
    setCurrentPage(idx);
    setHistoryVersion(v => v + 1);
  }, [saveCurrentPage]);

  // Load annotations when page changes
  useEffect(() => {
    if (!editorRef.current) return;
    const saved = annotationsRef.current[currentPage];
    if (saved) {
      setTimeout(() => editorRef.current?.loadJSON(saved), 50);
    }
  }, [currentPage, historyVersion]);

  const handleExport = async () => {
    if (!file) return;
    saveCurrentPage();
    setExporting(true);

    try {
      // For each page, get the annotation canvas as PNG (annotations only, no background)
      const annotationDataURLs: (string | null)[] = [];

      for (let i = 0; i < pageCount; i++) {
        const json = annotationsRef.current[i];
        if (!json || json === "{}") {
          annotationDataURLs.push(null);
          continue;
        }

        // Render annotation layer via offscreen fabric canvas
        const { Canvas } = await import("fabric");
        const offCanvas = document.createElement("canvas");
        offCanvas.width = canvasSize.width;
        offCanvas.height = canvasSize.height;
        const fc = new Canvas(offCanvas, { width: canvasSize.width, height: canvasSize.height });

        await new Promise<void>((resolve) => {
          fc.loadFromJSON(JSON.parse(json), () => {
            fc.renderAll();
            resolve();
          });
        });

        // Export just the annotation layer (transparent background)
        annotationDataURLs.push(offCanvas.toDataURL("image/png"));
        fc.dispose();
      }

      const result = await exportAnnotatedPDF(file, annotationDataURLs);
      downloadFile(result, `edited-${file.name}`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const forceUpdate = () => setHistoryVersion(v => v + 1);

  if (!file) {
    return (
      <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
        <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-yellow-400 flex items-center justify-center">
              <FileText className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">PDFChop</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> All tools
          </Link>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Edit PDF</h1>
            <p className="text-white/40">Add text, draw, highlight, and annotate your PDF pages.</p>
          </div>
          <DropZone onFiles={onFiles} files={[]} label="Drop a PDF to start editing" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Add Text", desc: "Type anywhere on the page" },
              { label: "Draw & Highlight", desc: "Freehand pen and highlighter" },
              { label: "Shapes", desc: "Add rectangles and signatures" },
            ].map(({ label, desc }) => (
              <div key={label} className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className="text-white text-sm font-medium mb-0.5">{label}</p>
                <p className="text-white/30 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col" style={{ background: "hsl(0 0% 4%)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[hsl(0_0%_5%)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-white/30 hover:text-white/60 text-sm transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/50 text-sm truncate max-w-48">{file.name}</span>
          {loading && <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs font-mono">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        tool={tool}
        color={color}
        fontSize={fontSize}
        brushSize={brushSize}
        onTool={setTool}
        onColor={setColor}
        onFontSize={setFontSize}
        onBrushSize={setBrushSize}
        onUndo={() => { editorRef.current?.undo(); forceUpdate(); }}
        onRedo={() => { editorRef.current?.redo(); forceUpdate(); }}
        onClear={() => editorRef.current?.clear()}
        canUndo={editorRef.current?.canUndo() ?? false}
        canRedo={editorRef.current?.canRedo() ?? false}
      />

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page strip */}
        <PageStrip
          thumbs={thumbs}
          currentPage={currentPage}
          totalPages={pageCount}
          onPage={goToPage}
        />

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-[hsl(0_0%_8%)]">
          {pageImages[currentPage] ? (
            <div className="relative shadow-2xl rounded-sm overflow-hidden" style={{ width: canvasSize.width, height: canvasSize.height }}>
              <CanvasEditor
                ref={editorRef}
                key={`page-${currentPage}`}
                pageImage={pageImages[currentPage]}
                tool={tool}
                color={color}
                fontSize={fontSize}
                brushSize={brushSize}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                <p className="text-white/30 text-sm">Loading pages...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom page nav */}
      <div className="flex items-center justify-center gap-4 py-2.5 border-t border-white/5 bg-[hsl(0_0%_5%)] flex-shrink-0">
        <button
          onClick={() => goToPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white/30 text-xs font-mono">
          Page {currentPage + 1} of {pageCount}
        </span>
        <button
          onClick={() => goToPage(Math.min(pageCount - 1, currentPage + 1))}
          disabled={currentPage === pageCount - 1}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-20 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
