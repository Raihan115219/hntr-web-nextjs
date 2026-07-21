export interface WebinarLanguage {
  code: string;
  flag: string;
  name: string;
  native: string;
}

export interface WebinarMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  me?: boolean;
}

export interface WebinarArticle {
  issue: string;
  readTime: string;
  title: string;
  subtitle: string;
}

export const WEBINAR_LANGUAGES: WebinarLanguage[] = [
  { code: "en", flag: "🇬🇧", name: "English", native: "English" },
  { code: "es", flag: "🇪🇸", name: "Spanish", native: "Español" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", native: "中文" },
  { code: "hi", flag: "🇮🇳", name: "Hindi", native: "हिन्दी" },
  { code: "ar", flag: "🇸🇦", name: "Arabic", native: "العربية" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese", native: "Português" },
  { code: "fr", flag: "🇫🇷", name: "French", native: "Français" },
  { code: "de", flag: "🇩🇪", name: "German", native: "Deutsch" },
  { code: "ru", flag: "🇷🇺", name: "Russian", native: "Русский" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", native: "日本語" },
  { code: "ko", flag: "🇰🇷", name: "Korean", native: "한국어" },
  { code: "tr", flag: "🇹🇷", name: "Turkish", native: "Türkçe" },
];

export const INITIAL_WEBINAR_MESSAGES: WebinarMessage[] = [
  {
    id: "1",
    user: "sarah.eth",
    text: "How does the hedging mechanism account for sudden liquidity drops in the underlying pools?",
    time: "14:42",
  },
  {
    id: "2",
    user: "alpha_cap",
    text: "The ZK-bridge tech looks promising for these specific vaults.",
    time: "14:44",
  },
  {
    id: "3",
    user: "whale_watcher",
    text: "Are we expecting the new v3 pools next week?",
    time: "14:45",
  },
];

export const WEBINAR_CHAT_REPLIES = [
  "Great question — the hedging desk covers that.",
  "Agreed, the vault architecture is solid.",
  "v3 pools are on track for next week.",
  "Watching this closely 👀",
  "The floor-price derivatives model is elegant.",
];

export const WEBINAR_CHAT_USERS = [
  "0xdegen",
  "vault_max",
  "nftpilot",
  "base_bull",
  "quiet_lp",
];

export const WEBINAR_ARTICLES: WebinarArticle[] = [
  {
    issue: "ISSUE #47 · 6 MIN READ",
    readTime: "6",
    title: "The 80/20 Rule: Where Your Commissions Really Come From",
    subtitle:
      "A breakdown of instant payouts and how the 20% redirect quietly fuels your next position.",
  },
  {
    issue: "ISSUE #46 · 4 MIN READ",
    readTime: "4",
    title: "Inside HNTR Pools: How Co-Ownership Compounds",
    subtitle:
      "Why fractionalized NFT vaults tend to outperform solo buys across a full market cycle.",
  },
  {
    issue: "ISSUE #45 · 5 MIN READ",
    readTime: "5",
    title: "Referral Mechanics Explained for New Hunters",
    subtitle:
      "From first invite to Elite Platinum — the numbers behind the HNTR network effect.",
  },
];

export const WEBINAR_BASE_VIEWERS = 14891;
