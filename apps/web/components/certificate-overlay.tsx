"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SiteCertificate } from "../lib/certificates";

type CertificateOverlayProps = {
  certificate: SiteCertificate | null;
  /** Called after the dialog has closed (Esc, close button or backdrop). */
  onClose: () => void;
  /** Element that gets focus back when the dialog closes. */
  returnFocusTo: HTMLElement | null;
};

/**
 * Larger certificate view. Uses the native <dialog> modal: it traps focus,
 * makes the page behind it inert and closes on Esc.
 */
export default function CertificateOverlay({
  certificate,
  onClose,
  returnFocusTo,
}: CertificateOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (certificate && !dialog.open) dialog.showModal();
    if (!certificate && dialog.open) dialog.close();
  }, [certificate]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
      returnFocusTo?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose, returnFocusTo]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="certificate-overlay-title"
      // Click on the backdrop (the dialog element itself) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-banner bg-surface p-0 text-text shadow-xl backdrop:bg-text/70"
    >
      {certificate && (
        <div className="p-4 lg:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3
              id="certificate-overlay-title"
              className="self-center text-lg font-bold tracking-wide text-brand-900 uppercase lg:text-xl"
            >
              {certificate.issuer}
            </h3>
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              aria-label="Close certificate"
              className="grid size-11 shrink-0 place-items-center rounded-pill text-body hover:bg-well focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <Image
            src={certificate.image}
            alt={certificate.alt}
            width={certificate.width}
            height={certificate.height}
            sizes="(min-width: 1024px) 848px, 100vw"
            className="h-auto max-h-[75vh] w-full rounded-card border border-line object-contain"
          />
        </div>
      )}
    </dialog>
  );
}
