import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Collection",
  "View your co-owned NFT positions, portfolio distribution, and holdings."
);

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
