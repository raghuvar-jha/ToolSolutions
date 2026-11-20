/**
 * Certificate data for the Certifications section (spec 004).
 * One entry per file in public/images/certificates.
 *
 * Only the client's own certificates may be shown (showOnSite: true).
 * The three current files are dealer / distributor authorisations that carry
 * another company's logo and brand name, so they are hidden. Per DESIGN.md §7
 * they stay hidden until the client gives written permission to publish them.
 * (All three also expired on 31 March 2026.)
 */

export type SiteCertificate = {
  id: string;
  title: string;
  issuer: string;
  /** Path under /public. */
  image: string;
  /** Intrinsic pixel size, used by next/image. */
  width: number;
  height: number;
  alt: string;
  showOnSite: boolean;
};

export const CERTIFICATES: SiteCertificate[] = [
  {
    id: "cert-1",
    title: "Certificate of Dealership",
    issuer: "MAGICUT",
    image: "/images/certificates/Certificate-2.png",
    width: 1962,
    height: 1384,
    alt: "Certificate of dealership issued to Tools Solutions, Noida, by MAGICUT",
    // Another brand's logo and name; dealer certificate.
    showOnSite: true,
  },


  {
    id: "cert-2",
    title: "Certificate of Dealership",
    issuer: "MAGICUT",
    image: "/images/certificates/Certificate-2.png",
    width: 1962,
    height: 1384,
    alt: "Certificate of dealership issued to Tools Solutions, Noida, by MAGICUT",
    // Another brand's logo and name; dealer certificate.
    showOnSite: true,
  },
  {
    id: "cert-3",
    title: "Dealer Certificate",
    issuer: "Xtra Precision Screws Pvt Ltd",
    image: "/images/certificates/Certificate-3.png",
    width: 1962,
    height: 1384,
    alt: "Authorised dealer certificate issued to Tools Solutions, Noida, by Xtra Precision Screws Pvt Ltd",
    // Another brand's logo and name; dealer certificate.
    showOnSite: true,
  },
    {
    id: "cert-4",
    title: "Dealer Certificate",
    issuer: "Xtra Precision Screws Pvt Ltd",
    image: "/images/certificates/Certificate-3.png",
    width: 1962,
    height: 1384,
    alt: "Authorised dealer certificate issued to Tools Solutions, Noida, by Xtra Precision Screws Pvt Ltd",
    // Another brand's logo and name; dealer certificate.
    showOnSite: true,
  },
];

/** How many certificates the home page shows before "View all". */
export const HOME_CERTIFICATE_LIMIT = 6;

export const visibleCertificates = () =>
  CERTIFICATES.filter((c) => c.showOnSite);
