import "./learn.css";
import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Learn",
  "Guides and resources to get started with HNTR and NFT co-ownership."
);

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
