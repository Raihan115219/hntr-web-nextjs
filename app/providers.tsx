"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { config } from "../lib/wagmi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          mode="dark"
          options={{
            hideBalance: true,
            hideTooltips: false,
            embedGoogleFonts: false,
            enforceSupportedChains: true,
          }}
          customTheme={{
            "--ck-font-family": "var(--fm, inherit)",
            "--ck-border-radius": "10px",
            "--ck-overlay-background": "rgba(10, 12, 10, .72)",
            "--ck-body-background": "#181d16",
            "--ck-body-background-secondary": "#212819",
            "--ck-body-background-tertiary": "#262f1c",
            "--ck-body-color": "#f2efea",
            "--ck-body-color-muted": "#9aa694",
            "--ck-body-divider": "#333d29",
            "--ck-primary-button-background": "#5E6B55",
            "--ck-primary-button-hover-background": "#4a5443",
            "--ck-primary-button-color": "#f2efea",
            "--ck-focus-color": "#5E6B55",
            "--ck-qr-border-color": "#5E6B55",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
