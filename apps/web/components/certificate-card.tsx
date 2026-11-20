import Image from "next/image";
import type { Ref } from "react";
import type { SiteCertificate } from "../lib/certificates";

type CertificateCardProps = {
  certificate: SiteCertificate;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Light gray tile that hugs the certificate image with a small even padding.
 * The whole card opens the larger view.
 */
export default function CertificateCard({
  certificate,
  onOpen,
  ref,
}: CertificateCardProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`View certificate from ${certificate.issuer}, larger`}
      className="group block w-full rounded-card bg-line p-2 transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-950 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:p-3"
    >
      <Image
        src={certificate.image}
        alt={certificate.alt}
        width={certificate.width}
        height={certificate.height}
        sizes="(min-width: 1024px) 380px, 45vw"
        className="h-auto w-full shadow-sm"
      />
    </button>
  );
}
