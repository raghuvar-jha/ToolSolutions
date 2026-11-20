/**
 * Static certificate data (spec 004). No API / database yet.
 *
 * Only images that exist in apps/web/public/images/certificates.
 * These certificates show third-party brand logos: DESIGN.md §7 requires the
 * client's written dealer authorization before they go live.
 */

export type Certificate = {
  id: string;
  name: string;
  image: string;
  /** Intrinsic image size, used to keep the original aspect ratio. */
  width: number;
  height: number;
};

export const certificates: Certificate[] = [
  {
    id: "cert-001",
    name: "Quality Certification",
    image: "/images/certificates/Certificate-1.png",
    width: 1962,
    height: 1384,
  },
  {
    id: "cert-002",
    name: "Business Certification",
    image: "/images/certificates/Certificate-2.png",
    width: 1962,
    height: 1384,
  },
  {
    id: "cert-003",
    name: "Product Certification",
    image: "/images/certificates/Certificate-3.png",
    width: 1962,
    height: 1384,
  },
  {
    id: "cert-004",
    name: "Product Certification",
    image: "/images/certificates/Certificate-3.png",
    width: 1962,
    height: 1384,
  },
];
