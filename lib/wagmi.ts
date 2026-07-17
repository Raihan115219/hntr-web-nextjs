"use client";

import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

// WalletConnect Cloud project id (free at https://cloud.reown.com). Only required for the
// WalletConnect connector (mobile wallet QR codes) - injected/browser wallets still work without it.
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig(
  getDefaultConfig({
    appName: "HNTR",
    appDescription: "HNTR Membership & Referral Network",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://hntr.app",
    appIcon: "/assets/images/logoMark.png",
    walletConnectProjectId,
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(rpcUrl),
    },
    ssr: true,
  }),
);

// This is used to tell the app that the config is available globally in the app
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
