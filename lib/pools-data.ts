export type PoolDetail = {
  id: string;
  metaId: string;
  name: string;
  shortName: string;
  series: string;
  target: string;
  raised: string;
  progress: number;
  gpProfit: string;
  gpChange: string;
  ethProfit: string;
  ethChange: string;
  usdtProfit: string;
  usdtNote: string;
  participants: number;
  floorEth: string;
  img: string;
  avatarImg: string;
  daysRemaining: number;
};

export const POOLS: Record<string, PoolDetail> = {
  "54587": {
    id: "54587",
    metaId: "ANI-BAYC-3362",
    name: "Bored Ape Yacht Club #3362",
    shortName: "Bored Ape #3362",
    series: "Series 1/1000",
    target: "10.00",
    raised: "4.52",
    progress: 45.2,
    gpProfit: "10.00%",
    gpChange: "↓ -0.2% wk avg",
    ethProfit: "1.75",
    ethChange: "↑ +0.05 week",
    usdtProfit: "$4,198.00",
    usdtNote: "Unrealised P&L",
    participants: 132,
    floorEth: "7.80",
    img: "/assets/images/pool-detail-bayc.jpg",
    avatarImg: "/assets/images/pool-detail-bayc.jpg",
    daysRemaining: 7,
  },
  "1": {
    id: "1",
    metaId: "ANI-BAYC-0291",
    name: "Bored Ape Yacht Club #0291",
    shortName: "Bored Ape #0291",
    series: "Series 1/10000",
    target: "10.00",
    raised: "4.52",
    progress: 45.2,
    gpProfit: "2.40%",
    gpChange: "↓ -0.2% wk avg",
    ethProfit: "1.20",
    ethChange: "↑ +0.05 week",
    usdtProfit: "$2,640.00",
    usdtNote: "Unrealised P&L",
    participants: 168,
    floorEth: "7.80",
    img: "/assets/images/image-6.jpg",
    avatarImg: "/assets/images/image-6.jpg",
    daysRemaining: 7,
  },
  "2": {
    id: "2",
    metaId: "ANI-PUNK-7804",
    name: "CryptoPunks #7804",
    shortName: "CryptoPunk #7804",
    series: "Series 1/10000",
    target: "31.00",
    raised: "22.30",
    progress: 71.9,
    gpProfit: "3.10%",
    gpChange: "↑ +0.1% wk avg",
    ethProfit: "2.45",
    ethChange: "↑ +0.12 week",
    usdtProfit: "$5,385.00",
    usdtNote: "Unrealised P&L",
    participants: 245,
    floorEth: "24.50",
    img: "/assets/images/image-12.png",
    avatarImg: "/assets/images/image-12.png",
    daysRemaining: 5,
  },
  "3": {
    id: "3",
    metaId: "ANI-PUDGY-0291",
    name: "Pudgy Penguins #0291",
    shortName: "Pudgy #0291",
    series: "Series 1/8888",
    target: "5.45",
    raised: "2.73",
    progress: 50.1,
    gpProfit: "2.40%",
    gpChange: "↓ -0.1% wk avg",
    ethProfit: "1.06",
    ethChange: "↑ +0.03 week",
    usdtProfit: "$2,330.00",
    usdtNote: "Unrealised P&L",
    participants: 211,
    floorEth: "4.20",
    img: "/assets/images/image-10.jpg",
    avatarImg: "/assets/images/image-10.jpg",
    daysRemaining: 9,
  },
  "4": {
    id: "4",
    metaId: "ANI-AZUKI-4471",
    name: "Azuki #4471",
    shortName: "Azuki #4471",
    series: "Series 1/10000",
    target: "1.42",
    raised: "0.32",
    progress: 22.5,
    gpProfit: "2.10%",
    gpChange: "↓ -0.3% wk avg",
    ethProfit: "0.68",
    ethChange: "↑ +0.02 week",
    usdtProfit: "$1,495.00",
    usdtNote: "Unrealised P&L",
    participants: 129,
    floorEth: "1.10",
    img: "/assets/images/image-11.jpg",
    avatarImg: "/assets/images/image-11.jpg",
    daysRemaining: 12,
  },
};

export const DEFAULT_POOL_ID = "54587";

export function getPoolById(id: string): PoolDetail {
  return POOLS[id] ?? POOLS[DEFAULT_POOL_ID];
}

export const OTHER_POOLS = [
  { name: "Bored Ape Yacht Club", activity: "5.1/10 ETH (51%)", emoji: "🦧" },
  { name: "CryptoPunks", activity: "5.1/10 ETH (51%)", emoji: "👾" },
  { name: "Pudgy Penguins", activity: "8.2/12 ETH (68%)", emoji: "🐧" },
  { name: "BAYC Zombie", activity: "3.5/8 ETH (44%)", emoji: "🧟" },
  { name: "BAYC 3D", activity: "6.8/14 ETH (49%)", emoji: "🦍" },
  { name: "BAYC Soldier", activity: "4.2/9 ETH (47%)", emoji: "🪖" },
];
