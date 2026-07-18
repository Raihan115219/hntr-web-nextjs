import { useQuery } from "@tanstack/react-query";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

export const OPENSEA_COLLECTION_SLUGS = {
  CryptoPunks: "cryptopunks",
  "Bored Ape Yacht Club": "boredapeyachtclub",
  Azuki: "azuki",
  Fidenza: "fidenza-by-tyler-hobbs",
} as const;

export type KnownCollection = keyof typeof OPENSEA_COLLECTION_SLUGS;

export interface OpenSeaCollectionStats {
  slug: string;
  name: string;
  floorPrice: number; // ETH
  totalVolume: number; // ETH
  nftCount: number;
  ownerCount: number;
  imageUrl: string;
  volumeOneDay: number;
  volumeSevenDay: number;
  volumeThirtyDay: number;
  /** Floor / volume change as a percentage (e.g. 2.4 = +2.4%) */
  changeOneDay: number;
  changeSevenDay: number;
  changeThirtyDay: number;
}

export interface OpenSeaSale {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract: string;
  chain: string;
  priceEth: number;
  openseaUrl: string;
  timestamp: number;
}

/** Extra blue-chips used on the homepage market overview. */
export const OPENSEA_HOME_MARKET_SLUGS = [
  "cryptopunks",
  "boredapeyachtclub",
  "azuki",
  "fidenza-by-tyler-hobbs",
  "pudgypenguins",
  "nakamigos",
  "doodles-official",
  "lilpudgys",
  "invisiblefriends",
  "bored-ape-kennel-club",
] as const;

export interface OpenSeaNFT {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract?: string;
  openseaUrl: string;
}

export interface OpenSeaListing {
  tokenId: string;
  name: string;
  imageUrl: string;
  collection: string;
  contract: string;
  chain: string;
  priceEth: number;
  source: string;
  openseaUrl: string;
}

function getApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
  return key?.replace(/^["']|["']$/g, "").trim();
}

function getHeaders(): Record<string, string> {
  const key = getApiKey();
  return key ? { "X-API-KEY": key } : {};
}

async function fetchOpenSea<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const isClient = typeof window !== "undefined";
  const url = isClient
    ? `/api/opensea?path=${encodeURIComponent(path)}`
    : `${OPENSEA_API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: isClient
      ? body
        ? { "Content-Type": "application/json" }
        : {}
      : {
          ...getHeaders(),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const resBody = await res.text().catch(() => "");
    throw new Error(`OpenSea API error: ${res.status} ${res.statusText} (${url}) ${resBody.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function parseEth(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function parseIntervalChange(interval: any): number {
  // Prefer explicit floor/price change; fall back to volume_change (fraction → %).
  const raw =
    interval?.floor_price_change ??
    interval?.price_change ??
    interval?.volume_change ??
    0;
  const num = Number(raw);
  if (Number.isNaN(num)) return 0;
  // OpenSea often returns fractions (0.024); treat |x| < 1 as fraction.
  return Math.abs(num) > 0 && Math.abs(num) < 1 ? num * 100 : num;
}

function findInterval(intervals: any[], key: string) {
  return (intervals || []).find(
    (i) => String(i?.interval || i?.period || "").toLowerCase().replace(/-/g, "_") === key,
  );
}

export async function fetchCollectionStats(slug: string): Promise<OpenSeaCollectionStats> {
  const stats = (await fetchOpenSea<any>(`/collections/${slug}/stats`)) ?? {};
  const collection = (await fetchOpenSea<any>(`/collections/${slug}`).catch(() => ({}))) ?? {};

  const total = stats.total || {};
  const intervals = stats.intervals || [];
  const oneDay = findInterval(intervals, "one_day");
  const sevenDay = findInterval(intervals, "seven_day");
  const thirtyDay = findInterval(intervals, "thirty_day");

  return {
    slug,
    name: collection.name || slug,
    floorPrice: parseEth(total.floor_price),
    totalVolume: parseEth(total.volume),
    nftCount: Number(collection.total_supply ?? total.num_owners ?? 0),
    ownerCount: Number(total.num_owners ?? 0),
    imageUrl: collection.image_url || "",
    volumeOneDay: parseEth(oneDay?.volume),
    volumeSevenDay: parseEth(sevenDay?.volume),
    volumeThirtyDay: parseEth(thirtyDay?.volume),
    changeOneDay: parseIntervalChange(oneDay),
    changeSevenDay: parseIntervalChange(sevenDay),
    changeThirtyDay: parseIntervalChange(thirtyDay),
  };
}

function paymentToEth(payment: any): number {
  if (!payment) return 0;
  const decimals = Number(payment.decimals ?? 18);
  const raw = payment.quantity ?? payment.value;
  if (raw === undefined || raw === null) return 0;
  try {
    const value = BigInt(String(raw));
    return decimals > 0 ? Number(value) / 10 ** decimals : Number(value);
  } catch {
    return parseEth(raw);
  }
}

export async function fetchCollectionSales(
  slug: string,
  limit = 8,
): Promise<OpenSeaSale[]> {
  const data = await fetchOpenSea<any>(
    `/events/collection/${slug}?event_type=sale&limit=${limit}`,
  );
  const events = data?.asset_events || data?.events || [];

  return events
    .map((event: any): OpenSeaSale | null => {
      const type = event.event_type || event.eventType;
      if (type && type !== "sale") return null;

      const nft = event.nft || event.asset || {};
      const tokenId = String(nft.identifier || nft.token_id || "");
      const contract = nft.contract || "";
      const chain = event.chain || nft.chain || "ethereum";
      if (!tokenId) return null;

      const priceEth = paymentToEth(event.payment);
      if (priceEth <= 0) return null;

      return {
        tokenId,
        name: nft.name || `${slug} #${tokenId}`,
        imageUrl: nft.display_image_url || nft.image_url || "",
        collection: nft.collection || slug,
        contract,
        chain,
        priceEth,
        openseaUrl:
          nft.opensea_url ||
          (contract
            ? `https://opensea.io/assets/${chain}/${contract}/${tokenId}`
            : `https://opensea.io/collection/${slug}`),
        timestamp: Number(event.event_timestamp || event.closing_date || 0),
      };
    })
    .filter(Boolean) as OpenSeaSale[];
}

export async function fetchCollectionNFTs(
  slug: string,
  limit = 8,
): Promise<OpenSeaNFT[]> {
  const data = await fetchOpenSea<any>(`/collection/${slug}/nfts?limit=${limit}`);
  const nfts = data?.nfts || [];

  return nfts.map((nft: any): OpenSeaNFT => ({
    tokenId: String(nft.identifier || nft.token_id || ""),
    name: nft.name || `${slug} #${nft.identifier || ""}`,
    imageUrl: nft.display_image_url || nft.image_url || "",
    collection: nft.collection || slug,
    contract: nft.contract,
    openseaUrl: nft.opensea_url || `https://opensea.io/assets/ethereum/${nft.contract}/${nft.identifier}`,
  }));
}

export async function fetchNFTMetadata(
  chain: string,
  contract: string,
  tokenId: string,
): Promise<OpenSeaNFT | null> {
  if (!contract || !tokenId) return null;
  const data = await fetchOpenSea<any>(`/chain/${chain}/contract/${contract}/nfts/${tokenId}`).catch(() => null);
  const nft = data?.nft;
  if (!nft) return null;

  return normalizeNft(nft, chain, contract, tokenId);
}

export async function fetchNFTsBatch(
  identifiers: { chain: string; contract_address: string; token_id: string }[],
): Promise<OpenSeaNFT[]> {
  if (!identifiers.length) return [];
  const data = await fetchOpenSea<any>("/nfts/batch", "POST", { identifiers });
  const nfts = data?.nfts || [];
  return nfts.map((nft: any) => normalizeNft(nft, nft.chain, nft.contract, nft.identifier));
}

function normalizeNft(nft: any, chain: string, contract: string, tokenId: string): OpenSeaNFT {
  return {
    tokenId: String(nft.identifier || tokenId),
    name: nft.name || `#${nft.identifier || tokenId}`,
    imageUrl: nft.display_image_url || nft.image_url || "",
    collection: nft.collection || "",
    contract: nft.contract || contract,
    openseaUrl: nft.opensea_url || `https://opensea.io/assets/${chain}/${contract}/${nft.identifier || tokenId}`,
  };
}

const nftMetadataCache: Record<string, Promise<OpenSeaNFT | null>> = {};

function getCachedNFTMetadata(chain: string, contract: string, tokenId: string): Promise<OpenSeaNFT | null> {
  const key = `${chain}:${contract}:${tokenId}`;
  if (!nftMetadataCache[key]) {
    nftMetadataCache[key] = fetchNFTMetadata(chain, contract, tokenId);
  }
  return nftMetadataCache[key];
}

export async function fetchBestListings(
  slug: string,
  limit = 8,
): Promise<OpenSeaListing[]> {
  const data = await fetchOpenSea<any>(`/listings/collection/${slug}/best?limit=${limit}`);
  const listings = data?.listings || [];

  const seen = new Set<string>();

  return listings
    .map((listing: any): OpenSeaListing | null => {
      const asset = listing?.asset;
      const offer = listing?.protocol_data?.parameters?.offer || [];
      const nftItem = asset || offer[0] || {};
      const tokenId = String(nftItem.identifier || nftItem.identifierOrCriteria || "");
      const contract = nftItem.contract || nftItem.token || "";
      const chain = listing?.chain || "ethereum";

      if (!tokenId || tokenId === "0" || !contract) {
        return null;
      }

      const dedupeKey = `${contract}:${tokenId}`;
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);

      const price = listing?.price?.current || {};
      const decimals = Number(price.decimals ?? 18);
      const rawValue = price.value ? BigInt(price.value) : BigInt(0);
      const priceEth = decimals > 0 ? Number(rawValue) / 10 ** decimals : Number(rawValue);

      return {
        tokenId,
        name: `${slug} #${tokenId}`,
        imageUrl: "",
        collection: slug,
        contract,
        chain,
        priceEth,
        source: "OpenSea",
        openseaUrl: `https://opensea.io/assets/${chain}/${contract}/${tokenId}`,
      };
    })
    .filter(Boolean) as OpenSeaListing[];
}

async function enrichListingsWithImages(
  listings: OpenSeaListing[],
  collectionNFTs: OpenSeaNFT[],
): Promise<OpenSeaListing[]> {
  const nftById = Object.fromEntries(collectionNFTs.map((n) => [n.tokenId, n]));

  // Find listings that need images fetched via batch endpoint
  const missing = listings.filter((l) => !nftById[l.tokenId]?.imageUrl && l.contract);
  let batchNfts: OpenSeaNFT[] = [];
  if (missing.length) {
    try {
      batchNfts = await fetchNFTsBatch(
        missing.map((l) => ({ chain: l.chain, contract_address: l.contract, token_id: l.tokenId })),
      );
    } catch (err) {
      console.error("OpenSea batch NFT fetch failed:", err);
    }
  }
  const batchById = Object.fromEntries(batchNfts.map((n) => [n.tokenId, n]));

  return listings.map((listing) => {
    const nft = nftById[listing.tokenId] || batchById[listing.tokenId];
    return {
      ...listing,
      imageUrl: nft?.imageUrl || "",
      name: nft?.name || listing.name,
    };
  });
}

/** Fetches stats + NFTs for all known collections. */
export function useOpenSeaCollections() {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "collections", slugs],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const stats = await fetchCollectionStats(slug);
          const nfts = await fetchCollectionNFTs(slug, 4);
          return { slug, stats, nfts };
        }),
      );

      const record: Record<string, { stats: OpenSeaCollectionStats; nfts: OpenSeaNFT[] }> = {};
      results.forEach((result, index) => {
        const slug = slugs[index];
        if (result.status === "fulfilled") {
          record[slug] = result.value;
        } else {
          console.error(`OpenSea collections failed for ${slug}:`, result.reason);
        }
      });

      return record;
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Fetches the best listings for a single collection, enriched with metadata. */
export function useOpenSeaListings(slug: string, limit = 8) {
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "listings", slug, limit],
    queryFn: async () => {
      const [listingsResult, nftsResult] = await Promise.allSettled([
        fetchBestListings(slug, limit),
        fetchCollectionNFTs(slug, limit),
      ]);

      const listings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
      const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];

      if (listingsResult.status === "rejected") {
        console.error(`OpenSea listings failed for ${slug}:`, listingsResult.reason);
      }
      if (nftsResult.status === "rejected") {
        console.error(`OpenSea NFTs failed for ${slug}:`, nftsResult.reason);
      }

      return enrichListingsWithImages(listings, nfts);
    },
    enabled: !!key && !!slug,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function formatFloorPrice(price: number): string {
  return `${price.toFixed(2)} ETH`;
}

export function formatUsd(ethPrice: number, ethUsd = 2900): string {
  return `$${(ethPrice * ethUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/** Fetches the best listings for all known collections, enriched with metadata. */
export function useOpenSeaMarketplaceListings(limitPerCollection = 4) {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "marketplace", slugs, limitPerCollection],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const [listingsResult, nftsResult] = await Promise.allSettled([
            fetchBestListings(slug, limitPerCollection),
            fetchCollectionNFTs(slug, limitPerCollection),
          ]);

          const listings = listingsResult.status === "fulfilled" ? listingsResult.value : [];
          const nfts = nftsResult.status === "fulfilled" ? nftsResult.value : [];

          if (listingsResult.status === "rejected") {
            console.error(`OpenSea marketplace listings failed for ${slug}:`, listingsResult.reason);
          }
          if (nftsResult.status === "rejected") {
            console.error(`OpenSea marketplace NFTs failed for ${slug}:`, nftsResult.reason);
          }

          return enrichListingsWithImages(listings, nfts);
        }),
      );

      return results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea marketplace batch failed for ${slugs[index]}:`, result.reason);
            return [];
          }
          return result.value;
        })
        .flat();
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Recent sales across known marketplace collections. */
export function useOpenSeaMarketplaceSales(limitPerCollection = 3) {
  const slugs = Object.values(OPENSEA_COLLECTION_SLUGS);
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "sales", slugs, limitPerCollection],
    queryFn: async () => {
      const results = await Promise.allSettled(
        slugs.map((slug) => fetchCollectionSales(slug, limitPerCollection)),
      );

      return results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea sales failed for ${slugs[index]}:`, result.reason);
            return [] as OpenSeaSale[];
          }
          return result.value;
        })
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export type MarketTimeFrame = "24H" | "7D" | "30D";

function volumeForTimeframe(stats: OpenSeaCollectionStats, tf: MarketTimeFrame): number {
  if (tf === "24H") return stats.volumeOneDay || stats.totalVolume;
  if (tf === "7D") return stats.volumeSevenDay || stats.totalVolume;
  return stats.volumeThirtyDay || stats.totalVolume;
}

function changeForTimeframe(stats: OpenSeaCollectionStats, tf: MarketTimeFrame): number {
  if (tf === "24H") return stats.changeOneDay;
  if (tf === "7D") return stats.changeSevenDay;
  return stats.changeThirtyDay;
}

/** Homepage market overview: floors, volumes, and ranked lists for a timeframe. */
export function useOpenSeaHomeMarket(timeFrame: MarketTimeFrame = "24H") {
  const slugs = [...OPENSEA_HOME_MARKET_SLUGS];
  const key = getApiKey();

  return useQuery({
    queryKey: ["opensea", "home-market", slugs, timeFrame],
    queryFn: async () => {
      const results = await Promise.allSettled(slugs.map((slug) => fetchCollectionStats(slug)));
      const collections = results
        .map((result, index) => {
          if (result.status === "rejected") {
            console.error(`OpenSea home market failed for ${slugs[index]}:`, result.reason);
            return null;
          }
          return result.value;
        })
        .filter(Boolean) as OpenSeaCollectionStats[];

      const withMeta = collections.map((c) => ({
        ...c,
        volume: volumeForTimeframe(c, timeFrame),
        change: changeForTimeframe(c, timeFrame),
      }));

      const totalVolume = withMeta.reduce((sum, c) => sum + (c.volume || 0), 0);
      const byVolume = [...withMeta].sort((a, b) => b.volume - a.volume);
      const byChange = [...withMeta].sort((a, b) => b.change - a.change);

      return {
        totalVolume,
        activeCollections: withMeta.length,
        top: byVolume.slice(0, 5),
        trending: byVolume.slice(0, 5),
        topFlyers: byChange.slice(0, 5),
      };
    },
    enabled: !!key,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function formatChangePct(change: number): string {
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  return `${sign}${Math.abs(change).toFixed(2)} %`;
}
