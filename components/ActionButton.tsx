"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
}

export default function ActionButton({
  onClick,
  loading,
  disabled,
  label,
  loadingLabel = "Processing...",
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
        loading || disabled
          ? "bg-yellow-400/20 text-yellow-400/40 cursor-not-allowed"
          : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-[0.98]"
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingLabel : label}
    </button>
  );
}
