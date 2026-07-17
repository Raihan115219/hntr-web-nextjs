import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Marketplace",
  "Browse and trade co-owned blue-chip NFTs on the HNTR marketplace."
);

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
