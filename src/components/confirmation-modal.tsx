"use client";

import { useEffect } from "react";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass-panel rounded-4xl p-8 max-w-md w-full shadow-2xl">
        <div className="space-y-4">
          {/* Title */}
          <h3 className="font-display text-2xl text-slate-900">{title}</h3>

          {/* Message */}
          <p className="text-base leading-6 text-(--muted)">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer flex-1 rounded-full border border-[rgba(31,41,55,0.12)] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="cursor-pointer flex-1 rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-deep)"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
