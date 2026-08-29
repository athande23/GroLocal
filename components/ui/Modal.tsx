"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-lg border border-line bg-paper p-0 backdrop:bg-ink/40 shadow-lg"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 sm:px-6 py-4 sm:py-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-semibold text-ink">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-md p-1.5 text-graphite transition-all duration-200 hover:text-ink hover:bg-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div className="px-5 sm:px-6 py-4 sm:py-5 text-base text-ink">{children}</div>
    </dialog>
  );
}
