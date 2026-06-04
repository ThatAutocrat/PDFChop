export type Tool = 'select' | 'text' | 'draw' | 'highlight' | 'rectangle' | 'signature' | 'eraser';

export interface PageAnnotations {
  [pageIndex: number]: string; // fabric JSON per page
}

export interface EditorState {
  tool: Tool;
  color: string;
  fontSize: number;
  brushSize: number;
  opacity: number;
}
