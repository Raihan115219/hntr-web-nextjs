export type DepositModalOptions = {
  assetName?: string;
  floorEth?: string;
};

export const DEPOSITS_ENABLED = false;
export const DEPOSIT_CTA_LABEL = "Coming Soon";

export function openDepositModal(
  assetName = "Pool Asset",
  floorEth = "0.00"
) {
  if (!DEPOSITS_ENABLED) return;
  window.openDepositModal?.(assetName, floorEth);
}

export function closeDepositModal() {
  window.closeDepositModal?.();
}

declare global {
  interface Window {
    openDepositModal?: (assetName?: string, floorEth?: string) => void;
    closeDepositModal?: () => void;
  }
}
