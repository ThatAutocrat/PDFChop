"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { Tool } from "./types";

export interface CanvasEditorHandle {
  getJSON: () => string;
  loadJSON: (json: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

interface CanvasEditorProps {
  pageImage: string;
  tool: Tool;
  color: string;
  fontSize: number;
  brushSize: number;
  width: number;
  height: number;
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  ({ pageImage, tool, color, fontSize, brushSize, width, height }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<any>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const savingRef = useRef(false);
    const initializedRef = useRef(false);

    const saveState = useCallback(() => {
      if (!fabricRef.current || savingRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      const history = historyRef.current;
      const idx = historyIndexRef.current;
      history.splice(idx + 1);
      history.push(json);
      historyIndexRef.current = history.length - 1;
    }, []);

    useImperativeHandle(ref, () => ({
      getJSON: () => fabricRef.current ? JSON.stringify(fabricRef.current.toJSON()) : "{}",
      loadJSON: (json: string) => {
        if (!fabricRef.current || !json || json === "{}") return;
        savingRef.current = true;
        fabricRef.current.loadFromJSON(JSON.parse(json)).then(() => {
          fabricRef.current?.renderAll();
          savingRef.current = false;
        });
      },
      clear: () => {
        if (!fabricRef.current) return;
        fabricRef.current.remove(...fabricRef.current.getObjects());
        fabricRef.current.renderAll();
        saveState();
      },
      undo: () => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current--;
        savingRef.current = true;
        const json = historyRef.current[historyIndexRef.current];
        fabricRef.current?.loadFromJSON(JSON.parse(json)).then(() => {
          fabricRef.current?.renderAll();
          savingRef.current = false;
        });
      },
      redo: () => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current++;
        savingRef.current = true;
        const json = historyRef.current[historyIndexRef.current];
        fabricRef.current?.loadFromJSON(JSON.parse(json)).then(() => {
          fabricRef.current?.renderAll();
          savingRef.current = false;
        });
      },
      canUndo: () => historyIndexRef.current > 0,
      canRedo: () => historyIndexRef.current < historyRef.current.length - 1,
    }));

    // Init fabric — runs once, guards against StrictMode double-invoke
    useEffect(() => {
      if (!containerRef.current || initializedRef.current) return;
      initializedRef.current = true;

      // Create a fresh canvas element inside the container
      const canvasEl = document.createElement("canvas");
      canvasEl.width = width;
      canvasEl.height = height;
      containerRef.current.appendChild(canvasEl);

      let fc: any;

      import("fabric").then(({ Canvas, FabricImage }) => {
        // Guard: container may have been unmounted during async import
        if (!containerRef.current) return;

        fc = new Canvas(canvasEl, {
          width,
          height,
          selection: true,
          preserveObjectStacking: true,
        });
        fabricRef.current = fc;

        FabricImage.fromURL(pageImage).then((img: any) => {
          if (!fabricRef.current) return;
          img.set({ left: 0, top: 0, selectable: false, evented: false, excludeFromExport: true });
          img.scaleToWidth(width);
          fc.backgroundImage = img;
          fc.renderAll();
        });

        fc.on("object:added", saveState);
        fc.on("object:modified", saveState);
        fc.on("object:removed", saveState);

        historyRef.current = [JSON.stringify(fc.toJSON())];
        historyIndexRef.current = 0;
      });

      return () => {
        initializedRef.current = false;
        if (fc) {
          fc.off("object:added", saveState);
          fc.off("object:modified", saveState);
          fc.off("object:removed", saveState);
          fc.dispose();
        }
        fabricRef.current = null;
        // Remove the canvas element we injected
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageImage, width, height]);

    // Apply tool / style changes
    useEffect(() => {
      const fc = fabricRef.current;
      if (!fc) return;

      import("fabric").then(({ PencilBrush, IText, Rect }) => {
        if (!fabricRef.current) return;

        fc.isDrawingMode = false;
        fc.selection = true;

        if (tool === "draw" || tool === "highlight" || tool === "signature" || tool === "eraser") {
          fc.isDrawingMode = true;
          const brush = new PencilBrush(fc);

          if (tool === "highlight") {
            brush.color = color + "55";
            brush.width = brushSize * 2;
          } else if (tool === "eraser") {
            brush.color = "#ffffff";
            brush.width = brushSize * 3;
          } else if (tool === "signature") {
            brush.color = color;
            brush.width = Math.max(1, Math.round(brushSize * 0.5));
          } else {
            brush.color = color;
            brush.width = brushSize;
          }

          fc.freeDrawingBrush = brush;
        }

        // Text tool — click to add
        const handleTextClick = (opt: any) => {
          if (tool !== "text") return;
          const pointer = fc.getScenePoint(opt.e);
          const text = new IText("Click to edit", {
            left: pointer.x,
            top: pointer.y,
            fontSize,
            fill: color,
            fontFamily: "DM Sans, sans-serif",
            editable: true,
          });
          fc.add(text);
          fc.setActiveObject(text);
          text.enterEditing();
          fc.renderAll();
        };

        // Rectangle tool — drag to draw
        let rect: any = null;
        let isDown = false;
        let origX = 0, origY = 0;

        const handleRectDown = (opt: any) => {
          if (tool !== "rectangle") return;
          isDown = true;
          const pointer = fc.getScenePoint(opt.e);
          origX = pointer.x;
          origY = pointer.y;
          rect = new Rect({
            left: origX, top: origY,
            width: 0, height: 0,
            fill: "transparent",
            stroke: color,
            strokeWidth: 2,
          });
          fc.add(rect);
        };
        const handleRectMove = (opt: any) => {
          if (!isDown || tool !== "rectangle" || !rect) return;
          const pointer = fc.getScenePoint(opt.e);
          rect.set({
            left: Math.min(pointer.x, origX),
            top: Math.min(pointer.y, origY),
            width: Math.abs(pointer.x - origX),
            height: Math.abs(pointer.y - origY),
          });
          fc.renderAll();
        };
        const handleRectUp = () => { isDown = false; rect = null; };

        fc.on("mouse:down", handleTextClick);
        fc.on("mouse:down", handleRectDown);
        fc.on("mouse:move", handleRectMove);
        fc.on("mouse:up", handleRectUp);

        return () => {
          fc.off("mouse:down", handleTextClick);
          fc.off("mouse:down", handleRectDown);
          fc.off("mouse:move", handleRectMove);
          fc.off("mouse:up", handleRectUp);
        };
      });
    }, [tool, color, fontSize, brushSize]);

    return (
      <div
        ref={containerRef}
        style={{ width, height, display: "block", touchAction: "none" }}
      />
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
