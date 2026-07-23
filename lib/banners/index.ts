import { initCollectionBanner } from "./collectionBanner";
import { initMembershipBanner } from "./membershipBanner";
import { initNetworkBanner } from "./networkBanner";
import { initReveal } from "./reveal";

export { setBannerResources, BANNER_ASSETS, COLLECTION_BANNER_IMAGES } from "./resources";
export { initReveal } from "./reveal";
export { initCollectionBanner } from "./collectionBanner";
export { initMembershipBanner } from "./membershipBanner";
export { initNetworkBanner } from "./networkBanner";
export { initPoolsBannerGears } from "./poolsBanner";

export type BannerAnimationKind = "home" | "collection" | "membership" | "network";

export function initBannerAnimation(
  kind: BannerAnimationKind,
  canvas: HTMLCanvasElement | null,
): (() => void) | undefined {
  switch (kind) {
    case "home":
      return initReveal(canvas);
    case "collection":
      return initCollectionBanner(canvas);
    case "membership":
      return initMembershipBanner(canvas);
    case "network":
      return initNetworkBanner(canvas);
    default:
      return undefined;
  }
}
