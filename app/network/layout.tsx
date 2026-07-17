import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "My Network",
  "Track referrals, commissions, rewards tiers, and your network topology."
);

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
