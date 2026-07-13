export type DepositModalOptions = {
  assetName?: string;
  floorEth?: string;
};

export function openDepositModal(
  assetName = "Pool Asset",
  floorEth = "0.00"
) {
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
