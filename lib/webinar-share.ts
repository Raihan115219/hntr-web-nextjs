export const WEBINAR_SHARE_TITLE = "HNTR Live Webinar — Q4 Strategy Session";
export const WEBINAR_SHARE_TEXT =
  "Join the HNTR live webinar on co-owned NFT pools, referral rewards, and Web3 strategy.";

export function getWebinarShareUrl() {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return "https://hntr.art/webinar";
}

export type SharePlatform = "whatsapp" | "facebook" | "x" | "linkedin" | "telegram" | "copy";

export function buildShareLink(platform: SharePlatform, pageUrl = getWebinarShareUrl()) {
  const text = `${WEBINAR_SHARE_TEXT} ${pageUrl}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(WEBINAR_SHARE_TITLE);

  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${encodedText}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(WEBINAR_SHARE_TEXT)}&url=${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    default:
      return pageUrl;
  }
}

export function openShareWindow(platform: SharePlatform, pageUrl?: string) {
  const url = buildShareLink(platform, pageUrl);
  window.open(url, "_blank", "noopener,noreferrer,width=640,height=720");
}
