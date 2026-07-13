"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DM_BALANCE = 4.25;
const DM_ETH_USD = 1820;

type DepositModalProps = {
  open: boolean;
  assetName: string;
  floorEth: string;
  onClose: () => void;
};

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

export default function DepositModal({ open, assetName, floorEth, onClose }: DepositModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [activePct, setActivePct] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setActivePct(null);
      setModalBodyLock(false);
      return;
    }
    setModalBodyLock(true);
    return () => setModalBodyLock(false);
  }, [open]);

  const num = parseFloat(amount) || 0;
  const usd = (num * DM_ETH_USD).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const canProceed = num > 0 && num <= DM_BALANCE;

  const setPct = (pct: number, label: string) => {
    const value = pct === 100 ? DM_BALANCE : parseFloat(((DM_BALANCE * pct) / 100).toFixed(4));
    setAmount(String(value));
    setActivePct(label);
  };

  const onInput = (val: string) => {
    setAmount(val);
    setActivePct(null);
  };

  const proceed = () => {
    if (!canProceed) return;
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`deposit-overlay${open ? " open" : ""}`}
      id="depositOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="deposit-modal" id="depositModal">
        <div className="dm-header">
          <div className="dm-title">ENTER DEPOSIT AMOUNT</div>
          <button className="dm-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dm-body">
          <div className="dm-asset-box">
            <div className="dm-asset-col">
              <div className="dm-asset-lbl">Pool Asset</div>
              <div className="dm-asset-val" id="dm-asset-name">
                {assetName}
              </div>
            </div>
            <div className="dm-asset-col dm-asset-col-right">
              <div className="dm-asset-lbl">Collection Floor</div>
              <div className="dm-asset-val" id="dm-floor">
                {floorEth} <span className="eth-ic"></span>
              </div>
            </div>
          </div>

          <div className="dm-amount-hdr">
            <div className="dm-amount-lbl">Amount to Deposit</div>
            <div className="dm-balance">
              Available Balance:{" "}
              <span>
                4.25 <span className="eth-ic"></span>
              </span>
            </div>
          </div>
          <div className="dm-input-wrap">
            <input
              className="dm-eth-input"
              id="dm-eth-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onInput(e.target.value)}
            />
            <div className="dm-eth-unit">ETH</div>
          </div>

          <div className="dm-usd-row">
            <div className="dm-usd-val" id="dm-usd-val">
              ≈ ${usd} USD
            </div>
            <div className="dm-pct-btns">
              {[
                { pct: 25, label: "25%" },
                { pct: 50, label: "50%" },
                { pct: 75, label: "75%" },
                { pct: 100, label: "MAX" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`dm-pct-btn${activePct === item.label ? " active" : ""}`}
                  type="button"
                  onClick={() => setPct(item.pct, item.label)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dm-divider"></div>

          <div className="dm-actions">
            <button className="dm-cancel-btn" type="button" onClick={onClose}>
              CANCEL
            </button>
            <button className="dm-proceed-btn" id="dm-proceed-btn" type="button" disabled={!canProceed} onClick={proceed}>
              PROCEED TO DEPOSIT
            </button>
          </div>

          <div className="dm-membership-info">
            <div className="dm-mem-rows">
              <div className="dm-mem-row">
                <span className="dm-mem-lbl">Membership:</span>
                <span className="dm-mem-val">RANGER ($750)</span>
              </div>
              <div className="dm-mem-row">
                <span className="dm-mem-lbl">Max Deposit:</span>
                <span className="dm-mem-val">$1,500 / $7,500</span>
              </div>
            </div>
            <button
              className="dm-upgrade-btn"
              type="button"
              onClick={() => {
                onClose();
                router.push("/membership");
              }}
            >
              UPGRADE
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
