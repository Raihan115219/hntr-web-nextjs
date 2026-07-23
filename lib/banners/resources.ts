export const BANNER_ASSETS = {
  revealTop: "/assets/hntr-src/reveal/original.jpg",
  revealBot: "/assets/hntr-src/reveal/neon.png",
  logoMark: "/assets/hntr-src/logo-mark-clean.png",
} as const;

export const COLLECTION_BANNER_IMAGES = [
  "/assets/collection-banner/nft-bayc.jpg",
  "/assets/collection-banner/uploads_dc1c7de19a6db048dd00c584b5023d24.jpg",
  "/assets/collection-banner/nft-pudgy.jpg",
  "/assets/collection-banner/uploads_images__3_-52693143.jpeg",
  "/assets/collection-banner/nft-punk.jpg",
  "/assets/collection-banner/uploads_images__2_-b63bb95d.jpeg",
  "/assets/collection-banner/nft-bayc3d.jpg",
  "/assets/collection-banner/uploads_moonbirds-e1650607833145.png",
  "/assets/collection-banner/nft-ape-captain.jpeg",
  "/assets/collection-banner/uploads_download-b376d313.png",
  "/assets/collection-banner/nft-penguin2.png",
  "/assets/collection-banner/uploads_share-logo.png",
  "/assets/collection-banner/nft-dog.jpg",
  "/assets/collection-banner/uploads_images__1_-83e5b7c1.jpeg",
  "/assets/collection-banner/nft-ape-demon.jpeg",
  "/assets/collection-banner/uploads_doodle.png",
  "/assets/collection-banner/nft-bayc-soldier.jpg",
  "/assets/collection-banner/uploads_dooles1.jpeg",
  "/assets/collection-banner/nft-ape-crown.jpeg",
] as const;

export function setBannerResources() {
  if (typeof window === "undefined") return;
  window.__resources = {
    ...(window.__resources || {}),
    revealTop: BANNER_ASSETS.revealTop,
    revealBot: BANNER_ASSETS.revealBot,
    logoMark: BANNER_ASSETS.logoMark,
  };
}

declare global {
  interface Window {
    __resources?: Record<string, string>;
  }
}
