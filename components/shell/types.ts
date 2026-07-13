export type NavItem = {
  label: string;
  href: string;
  short: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", short: "HM" },
  { label: "Marketplace", href: "/marketplace", short: "MP" },
  { label: "NFT Strategies", href: "/pools", short: "NS" },
  { label: "My NFTs", href: "/collection", short: "MY" },
  { label: "Membership", href: "/membership", short: "MB" },
  { label: "Network", href: "/network", short: "NW" },
  { label: "Learn", href: "/learn", short: "LR" }
];
