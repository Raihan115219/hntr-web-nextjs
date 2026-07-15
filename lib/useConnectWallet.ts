"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Address } from "viem";
import { useAccount, useConfig } from "wagmi";
import { watchAccount } from "wagmi/actions";
import { useModal } from "connectkit";

/**
 * Opens the ConnectKit wallet picker (injected wallets, WalletConnect, Coinbase Wallet, etc.)
 * and resolves once the user finishes connecting. Lets existing call sites keep their
 * `await connectWallet()` flow instead of wiring a specific connector by hand.
 */
export function useConnectWallet() {
  const { address, isConnected } = useAccount();
  const { open, setOpen } = useModal();
  const config = useConfig();

  const pendingRef = useRef<{
    resolve: (address: Address) => void;
    reject: (error: Error) => void;
  } | null>(null);

  useEffect(() => {
    const unwatch = watchAccount(config, {
      onChange(account) {
        if (pendingRef.current && account.isConnected && account.address) {
          pendingRef.current.resolve(account.address);
          pendingRef.current = null;
        }
      },
    });
    return () => unwatch();
  }, [config]);

  useEffect(() => {
    if (open || !pendingRef.current) return;
    // The modal just closed - give the connection a beat to land before treating it as cancelled.
    const timer = setTimeout(() => {
      if (pendingRef.current && !isConnected) {
        pendingRef.current.reject(new Error("Wallet connection was cancelled."));
        pendingRef.current = null;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [open, isConnected]);

  const connectWallet = useCallback((): Promise<Address> => {
    if (isConnected && address) return Promise.resolve(address);
    return new Promise<Address>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      setOpen(true);
    });
  }, [address, isConnected, setOpen]);

  return { connectWallet };
}
