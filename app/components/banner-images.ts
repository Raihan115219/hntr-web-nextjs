export const BANNER_IMAGES = {
  home: "/assets/images/banners-export/banner-home-1115x158.png",
  collection: "/assets/images/banners-export/banner-collection-552x158.png",
  pools: "/assets/images/banners-export/banner-pools-552x188.png",
  membership: "/assets/images/banners-export/banner-membership-516x158.png",
  network: "/assets/images/banners-export/banner-network-516x158.png",
} as const;

/** Source PNG dimensions */
export const BANNER_DIMENSIONS = {
  home: { width: 1115, height: 158 },
  collection: { width: 552, height: 158 },
  pools: { width: 552, height: 188 },
  membership: { width: 516, height: 158 },
  network: { width: 516, height: 158 },
} as const;

/** Home banner aspect ratio — all page banners match this height */
export const HOME_BANNER_ASPECT_RATIO = `${BANNER_DIMENSIONS.home.width} / ${BANNER_DIMENSIONS.home.height}` as const;
