"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

/** How long the message stays before the removal is final. */
const UNDO_MS = 5000;

type UndoToastProps = {
  /** Changes for every new removal, restarting the timer. */
  id: number;
  message: string;
  onUndo: () => void;
  onClose: () => void;
};

/** "Item removed. Undo" for 5 seconds. Above the sticky checkout bar on mobile. */
export default function UndoToast({ id, message, onUndo, onClose }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, UNDO_MS);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(140px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm items-center gap-3 rounded-card bg-brand-950 py-2 pr-2 pl-4 text-[15px] text-surface shadow-lg lg:bottom-6"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className={`rounded-md px-3 py-2 font-semibold text-brand-200 underline-offset-2 hover:underline ${FOCUS}`}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className={`grid size-9 place-items-center rounded-md hover:bg-brand-900 ${FOCUS}`}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
