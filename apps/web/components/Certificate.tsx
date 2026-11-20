import Image from "next/image";
import { certificates, type Certificate } from "../lib/certificate";

// Same as the planned components/Container.tsx (DESIGN.md §2).
const CONTAINER = "mx-auto w-full max-w-site px-4 lg:px-6";

function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-2 shadow-sm sm:p-3 lg:p-5">
      {/* Frame: dark outer border + white mat, image keeps its own ratio. */}
      <div className="border-3 border-text bg-surface p-1 shadow-md sm:border-4 sm:p-1.5 lg:border-[6px] lg:p-2">
        <Image
          src={certificate.image}
          alt={`${certificate.name} certificate`}
          width={certificate.width}
          height={certificate.height}
          sizes="(min-width: 1024px) 480px, 45vw"
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-2 text-center text-xs font-semibold text-text sm:text-sm lg:mt-4 lg:text-base">
        {certificate.name}
      </figcaption>
    </figure>
  );
}

export function CertificateSection() {
  return (
    <section aria-labelledby="certifications-heading" className="bg-well">
      <div className={`${CONTAINER} py-8 lg:py-12`}>
        <h2
          id="certifications-heading"
          className="mb-4 text-[22px] font-semibold text-text lg:mb-8 lg:text-[28px]"
        >
          Our Certifications
        </h2>
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-3 lg:gap-6">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              // A lone last item (odd count) is centered in its row.
              className="odd:last:col-span-2 odd:last:w-[calc(50%-0.375rem)] odd:last:justify-self-center lg:odd:last:w-[calc(50%-0.75rem)]"
            >
              <CertificateCard certificate={certificate} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CertificateSection;
