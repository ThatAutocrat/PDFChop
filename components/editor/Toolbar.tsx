"use client";
import { Tool } from "./types";
import {
  MousePointer2, Type, Pen, Highlighter, Square, PenLine, Eraser,
  Undo2, Redo2, Trash2, ChevronDown
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#FFFFFF", "#FACC15", "#F87171", "#34D399", "#60A5FA",
  "#C084FC", "#FB923C", "#000000", "#374151",
];

const TOOLS: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "text", icon: Type, label: "Text" },
  { id: "draw", icon: Pen, label: "Draw" },
  { id: "highlight", icon: Highlighter, label: "Highlight" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "signature", icon: PenLine, label: "Signature" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

interface ToolbarProps {
  tool: Tool;
  color: string;
  fontSize: number;
  brushSize: number;
  onTool: (t: Tool) => void;
  onColor: (c: string) => void;
  onFontSize: (s: number) => void;
  onBrushSize: (s: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function Toolbar({
  tool, color, fontSize, brushSize,
  onTool, onColor, onFontSize, onBrushSize,
  onUndo, onRedo, onClear, canUndo, canRedo,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-white/5 bg-[hsl(0_0%_6%)]">
      {/* Tool buttons */}
      <div className="flex items-center gap-0.5 mr-2">
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => onTool(id)}
            className={cn(
              "p-2 rounded-lg transition-all",
              tool === id
                ? "bg-yellow-400 text-black"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Color picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: color }} />
          <ChevronDown className="w-3 h-3 text-white/30" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 rounded-xl bg-[hsl(0_0%_10%)] border border-white/10 shadow-xl z-50 flex gap-1.5 flex-wrap w-36">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { onColor(c); setShowColorPicker(false); }}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-yellow-400" : "border-transparent"
                )}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => onColor(e.target.value)}
              className="w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer bg-transparent"
              title="Custom color"
            />
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Size controls */}
      {(tool === "text") && (
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Size</span>
          <input
            type="range" min={10} max={72} value={fontSize}
            onChange={(e) => onFontSize(Number(e.target.value))}
            className="w-20 accent-yellow-400"
          />
          <span className="text-white/40 text-xs font-mono w-6">{fontSize}</span>
        </div>
      )}

      {(tool === "draw" || tool === "highlight" || tool === "eraser" || tool === "signature") && (
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Size</span>
          <input
            type="range" min={1} max={tool === "highlight" ? 40 : 30} value={brushSize}
            onChange={(e) => onBrushSize(Number(e.target.value))}
            className="w-20 accent-yellow-400"
          />
          <span className="text-white/40 text-xs font-mono w-6">{brushSize}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* History controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClear}
          title="Clear page annotations"
          className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
