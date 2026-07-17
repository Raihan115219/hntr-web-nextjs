import type { Metadata } from "next";

export const SITE_NAME = "HNTR";

export const DEFAULT_DESCRIPTION =
  "Your gateway to the NFT universe — co-own blue-chip NFTs, earn rewards, and grow your network.";

export const rootMetadata: Metadata = {
  title: {
    template: `%s — ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
};

export function pageMetadata(
  title: string,
  description: string = DEFAULT_DESCRIPTION
): Metadata {
  return { title, description };
}
