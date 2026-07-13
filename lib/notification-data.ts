export type StandardToastData = {
  title: string;
  sub: string;
  link: string;
};

export type SaleToastData = {
  nft: string;
  img: string;
  eth: string;
  profitEth: string;
  profitUsd: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  sub: string;
  time: string;
  read: boolean;
};

export const STANDARD_TOASTS: StandardToastData[] = [
  {
    title: "Referral Commission claimed successfully",
    sub: "0.25 ETH claimed to wallet: 0x71C…492",
    link: "VIEW TRANSACTION",
  },
  {
    title: "Pool Reward claimed successfully",
    sub: "1.15 ETH claimed to wallet: 0x71C…492",
    link: "VIEW TRANSACTION",
  },
  {
    title: "Pool Deposit Successful",
    sub: "1.25 ETH deposited into Fidenza #565",
    link: "VIEW TRANSACTION",
  },
  {
    title: "NFT Listing Updated",
    sub: "BAYC #9112 listed for 7.75 ETH",
    link: "VIEW LISTING",
  },
  {
    title: "Rank Bonus Received",
    sub: "+$31,005 credited to your account",
    link: "VIEW REWARDS",
  },
  {
    title: "New Network Member Joined",
    sub: "0x3A8…12D joined via your referral link",
    link: "VIEW NETWORK",
  },
];

export const SALE_TOASTS: SaleToastData[] = [
  {
    nft: "CryptoPunks #3100",
    img: "/assets/images/image-10.jpg",
    eth: "18.75",
    profitEth: "4.25",
    profitUsd: "8,950",
  },
  {
    nft: "BAYC #9112",
    img: "/assets/images/pool-detail-bayc.jpg",
    eth: "12.40",
    profitEth: "2.80",
    profitUsd: "5,096",
  },
  {
    nft: "Pudgy Penguin #6523",
    img: "/assets/images/image-7.jpg",
    eth: "5.20",
    profitEth: "1.10",
    profitUsd: "2,002",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Pool Deposit Successful",
    sub: "1.25 ETH deposited into BAYC Pool #3362",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "Referral Commission earned",
    sub: "0.25 ETH from network activity",
    time: "14m ago",
    read: false,
  },
  {
    id: "3",
    title: "Pool Reward claimed",
    sub: "1.15 ETH sent to your wallet",
    time: "1h ago",
    read: true,
  },
  {
    id: "4",
    title: "New pool available",
    sub: "Azuki Pool #3365 is now open for deposits",
    time: "3h ago",
    read: true,
  },
  {
    id: "5",
    title: "Rank Bonus paid",
    sub: "$31,005.00 one-time bonus distributed",
    time: "1d ago",
    read: true,
  },
];

export const STANDARD_TOAST_DURATION_MS = 1000;
export const SALE_TOAST_DURATION_MS = 1200;
