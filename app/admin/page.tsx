"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCard,
  AdminTable,
  StatusBadge,
  AdminModal,
  useNotifications,
  NotificationPortal,
} from "@/components/admin/UI";
import {
  adminApi,
  AdminApiError,
  AdminUser,
  AdminTransaction,
  AdminWalletBalance,
  AdminWalletLedgerEntry,
  AdminActivity,
  LeadershipPreview,
  OverdueWallet,
  OverdueClaimFilter,
  PaginationMeta,
  formatUsd,
} from "@/lib/admin/api";
import { clearStoredAuth } from "@/lib/api";
import { useConnectWallet } from "@/lib/useConnectWallet";
import { CONTRACT_ADDRESS, TOKEN_ADDRESSES, hntrMembershipAbi } from "@/lib/contracts";
import { config } from "@/lib/wagmi";
import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

function isWithdrawalTransactionType(type: string): boolean {
  return type.includes("Withdrawal") || type.includes("WITHDRAW") || type === "COMMISSION_CLAIM" || type === "COMPANY_WALLET_WITHDRAWN";
}

function transactionAmountColor(type: string): string {
  return isWithdrawalTransactionType(type) ? "text-white" : "text-green-500";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { notifications, notify } = useNotifications();

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricCards, setMetricCards] = useState<{ title: string; value: string | number; subValue?: string }[]>([]);

  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const [leadershipPreview, setLeadershipPreview] = useState<LeadershipPreview | null>(null);
  const [totalUnclaimed, setTotalUnclaimed] = useState(0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [upgradeTier, setUpgradeTier] = useState("");
  const [upgradeRank, setUpgradeRank] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const patchUserRef = useRef<(username: string, tier: string, rank: string) => void>(() => {});

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const data = await adminApi.getMetrics();
      setMetricCards(data.cards || []);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load metrics");
    } finally {
      setMetricsLoading(false);
    }
  }, [notify]);

  const loadMaintenance = useCallback(async () => {
    try {
      const data = await adminApi.getMaintenance();
      setMaintenanceMode(data.maintenanceMode);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    loadMaintenance();
    adminApi.getOverdueCommissions("USDT", 1, 1).then((d) => setTotalUnclaimed(d.totalUnclaimedUSD || 0)).catch(() => {});
    // Intentionally mount-only — loaders are stable via useCallback([notify]) and notify is now stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDistributeLeadership = async () => {
    setActionLoading(true);
    try {
      const result = await adminApi.distributeLeadership();
      setIsLeadershipModalOpen(false);
      const paid = (result as { paid?: number }).paid ?? 0;
      const failed = (result as { failed?: number }).failed ?? 0;
      const month = (result as { month?: string }).month;
      notify(
        "success",
        `Leadership cron ran${month ? ` for ${month}` : ""}: ${paid} paid${failed ? `, ${failed} failed` : ""}.`,
      );
      loadMetrics();
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Leadership distribution failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openLeadershipModal = async () => {
    setActionLoading(true);
    try {
      const preview = await adminApi.getLeadershipPreview();
      setLeadershipPreview(preview);
      setIsLeadershipModalOpen(true);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load leadership preview");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    setActionLoading(true);
    try {
      const next = !maintenanceMode;
      await adminApi.setMaintenance(next);
      setMaintenanceMode(next);
      setIsMaintenanceModalOpen(false);
      notify("success", next ? "Maintenance mode enabled." : "Maintenance mode disabled.");
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to update maintenance mode");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <NotificationPortal notifications={notifications} />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white/90">Platform Metrics</h2>
          <div className="text-xs text-gray-500 font-medium bg-[#111] px-3 py-1 rounded-full border border-[#222]">
            {metricsLoading ? "Loading..." : "Live Statistics"}
          </div>
        </div>
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#111] border border-[#222] p-6 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {metricCards.map((m, i) => (
              <AdminCard key={i} {...m} />
            ))}
          </div>
        )}
      </section>

      <div className="flex border-b border-[#222] overflow-x-auto">
        {["overview", "users", "transactions", "wallets", "unclaimed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-semibold capitalize transition-all relative whitespace-nowrap ${
              activeTab === tab ? "text-[#f50]" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f50]" />}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab notify={notify} />}
      {activeTab === "users" && (
        <UsersTabContent
          onUpgradeClick={(user) => {
            setSelectedUser(user);
            setUpgradeTier(user.tier === "None" ? "Bronze" : user.tier);
            setUpgradeRank(user.rank === "None" ? "Scout" : user.rank);
            setIsUpgradeModalOpen(true);
          }}
          onPatchUserReady={(patchUser) => {
            patchUserRef.current = patchUser;
          }}
          notify={notify}
        />
      )}
      {activeTab === "transactions" && <TransactionsTabContent notify={notify} />}
      {activeTab === "wallets" && <WalletsTabContent notify={notify} />}
      {activeTab === "unclaimed" && (
        <UnclaimedTabContent
          notify={notify}
          onTotalChange={setTotalUnclaimed}
        />
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-bold">Quick Controls</h3>
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4 max-w-md">
          <button
            onClick={openLeadershipModal}
            disabled={actionLoading}
            className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            Run Leadership Monthly Cron
          </button>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("unclaimed")}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all"
            >
              View Unclaimed Wallets
            </button>
            <div className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-wider">
              {formatUsd(totalUnclaimed)} Unclaimed Pending
            </div>
          </div>
          <button
            onClick={() => setIsMaintenanceModalOpen(true)}
            className={`w-full border py-3 rounded-xl text-sm font-bold transition-all ${
              maintenanceMode
                ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/5"
                : "border-[#f50]/10 text-[#f50]/60 hover:text-[#f50] hover:bg-[#f50]/5"
            }`}
          >
            {maintenanceMode ? "Maintenance Mode ON" : "System Maintenance Mode"}
          </button>
        </div>
      </div>

      <AdminModal isOpen={isLeadershipModalOpen} onClose={() => setIsLeadershipModalOpen(false)} title="Run Leadership Monthly Cron">
        <div className="space-y-6">
          <p className="text-gray-400 text-sm leading-relaxed">
            Manually triggers the same job as the scheduled cron (1st of month, 00:00 UTC): distributes the
            on-chain leadership wallet balance pro-rata by share weights (Hunter=1, Elite=3, Master=7, Legend=15).
          </p>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222] space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Pool Balance</span>
              <span className="text-sm font-bold text-white">{formatUsd(leadershipPreview?.poolBalanceUSD ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Total Shares</span>
              <span className="text-sm font-bold text-white">{leadershipPreview?.totalShares ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Eligible Users</span>
              <span className="text-sm font-bold text-white">{leadershipPreview?.eligibleCount ?? 0}</span>
            </div>
            {leadershipPreview?.poolTokens?.length ? (
              <div className="pt-2 border-t border-[#222] flex gap-3 flex-wrap">
                {leadershipPreview.poolTokens.map((t) => (
                  <span key={t.symbol} className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#111] px-2 py-1 rounded">
                    {t.symbol}: {formatUsd(t.balance)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {leadershipPreview?.eligibleUsers?.length ? (
            <div className="max-h-48 overflow-y-auto bg-[#111] border border-[#222] rounded-xl">
              <AdminTable headers={["User", "Rank", "Shares", "Est. Payout"]}>
                {leadershipPreview.eligibleUsers.map((u) => (
                  <tr key={u.username} className="hover:bg-[#1a1a1a]">
                    <td className="px-4 py-2 text-sm font-bold">{u.username}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{u.rank}</td>
                    <td className="px-4 py-2 text-sm">{u.shares}</td>
                    <td className="px-4 py-2 text-sm text-green-500 font-bold">{formatUsd(u.estimatedPayoutUSD ?? 0)}</td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center">No Hunter+ ranks currently eligible.</p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setIsLeadershipModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-[#222] text-sm font-bold">
              Cancel
            </button>
            <button
              onClick={handleDistributeLeadership}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 rounded-xl bg-[#f50] text-sm font-bold disabled:opacity-50"
            >
              {actionLoading ? "Running cron..." : "Run Cron Now"}
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} title={`Upgrade Profile: ${selectedUser?.username || "User"}`}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target Membership</label>
              <select
                value={upgradeTier}
                onChange={(e) => setUpgradeTier(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]"
              >
                {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Override Rank</label>
              <select
                value={upgradeRank}
                onChange={(e) => setUpgradeRank(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]"
              >
                {["Scout", "Tracker", "Ranger", "Hunter", "Elite Hunter", "Master Hunter", "Legend Hunter"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={async () => {
              if (!selectedUser) return;
              setActionLoading(true);
              try {
                const result = await adminApi.overrideUser(selectedUser.username, upgradeTier, upgradeRank);
                patchUserRef.current(result.username, result.tier, result.rank);
                setIsUpgradeModalOpen(false);
                notify("success", `User ${selectedUser.username} profile updated.`);
              } catch (err) {
                notify("error", err instanceof AdminApiError ? err.message : "Update failed");
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="w-full bg-[#f50] py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10 disabled:opacity-50"
          >
            {actionLoading ? "Saving..." : "Confirm Upgrades"}
          </button>
        </div>
      </AdminModal>

      <AdminModal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} title="System Maintenance Mode">
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            {maintenanceMode
              ? "Maintenance mode is currently ON. Disable to restore normal operations."
              : "Enable maintenance mode to temporarily restrict platform access."}
          </p>
          <button
            onClick={toggleMaintenance}
            disabled={actionLoading}
            className={`w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 ${
              maintenanceMode ? "bg-green-600" : "bg-yellow-600"
            }`}
          >
            {actionLoading ? "Updating..." : maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}

function OverviewTab({ notify }: { notify: (type: "success" | "error" | "info", message: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminActivity[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(
    async (nextPage = page, nextLimit = limit) => {
      setLoading(true);
      try {
        const data = await adminApi.getActivity(nextPage, nextLimit);
        setItems(data.items);
        setPagination(data.pagination);
        setPage(nextPage);
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load activity");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, notify],
  );

  useEffect(() => {
    load(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <AdminTable
      headers={["Type", "User", "Amount", "Status"]}
      title="Recent Network Activity"
      pagination={pagination}
      onPageChange={(p) => load(p, limit)}
      onPageSizeChange={(size) => {
        setLimit(size);
        load(1, size);
      }}
    >
      {loading ? (
        <tr>
          <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
            Loading activity...
          </td>
        </tr>
      ) : items.length === 0 ? (
        <tr>
          <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
            No recent activity
          </td>
        </tr>
      ) : (
        items.map((row) => (
          <tr key={row.id} className="hover:bg-[#1a1a1a] transition-colors">
            <td className="px-6 py-4 text-sm font-medium">{row.type}</td>
            <td className="px-6 py-4 text-sm text-gray-400">{row.user}</td>
            <td className={`px-6 py-4 text-sm font-bold ${transactionAmountColor(row.type)}`}>
              {isWithdrawalTransactionType(row.type) ? "-" : "+"}
              {formatUsd(row.amount)}
            </td>
            <td className="px-6 py-4 text-sm">
              <StatusBadge status={row.status} />
            </td>
          </tr>
        ))
      )}
    </AdminTable>
  );
}

function WalletsTabContent({ notify }: { notify: (type: "success" | "error" | "info", message: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<AdminWalletBalance[]>([]);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerWallet, setLedgerWallet] = useState<AdminWalletBalance | null>(null);
  const [ledgerRows, setLedgerRows] = useState<AdminWalletLedgerEntry[]>([]);
  const [ledgerTotals, setLedgerTotals] = useState<{ inflow: number; outflow: number }>({ inflow: 0, outflow: 0 });
  const [ledgerSource, setLedgerSource] = useState<string>("");
  const [ledgerPagination, setLedgerPagination] = useState<PaginationMeta | null>(null);
  const [ledgerLimit, setLedgerLimit] = useState(10);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await adminApi.getWalletBalances();
        setWallets(data);
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load wallets");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLedger = async (wallet: AdminWalletBalance, page = 1, limit = ledgerLimit) => {
    setLedgerLoading(true);
    try {
      const data = await adminApi.getWalletLedger(wallet.key, page, limit);
      setLedgerRows(data.items || []);
      setLedgerPagination(data.pagination);
      setLedgerTotals(data.totals || { inflow: 0, outflow: 0 });
      setLedgerSource(data.source || "");
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load ledger");
    } finally {
      setLedgerLoading(false);
    }
  };

  const openLedger = (wallet: AdminWalletBalance) => {
    setLedgerWallet(wallet);
    setLedgerOpen(true);
    loadLedger(wallet, 1, ledgerLimit);
  };

  if (loading) {
    return <div className="text-gray-500 text-sm py-8 text-center">Loading wallet balances...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <div key={w.key} className="bg-[#111] border border-[#222] rounded-2xl p-8 space-y-4">
            <div>
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{w.name}</h4>
              <div className="text-3xl font-bold">
                {formatUsd(w.balance)}
              </div>
              {w.tokens?.length ? (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {w.tokens.map((t) => (
                    <span key={t.symbol} className="text-[10px] text-gray-500 font-bold uppercase">
                      {t.symbol} {formatUsd(t.balance)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="pt-4 border-t border-[#222]">
              <div className="text-[10px] text-gray-600 font-mono mb-4 break-all">{w.address}</div>
              <button
                onClick={() => openLedger(w)}
                className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] py-2 rounded-lg text-xs font-bold transition-all"
              >
                View Ledger
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal isOpen={ledgerOpen} onClose={() => setLedgerOpen(false)} title={`Ledger: ${ledgerWallet?.name || "Wallet"}`}>
        <div className="space-y-4">
          <div className="flex gap-4 text-xs">
            <div className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-xl p-3">
              <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Inflow</div>
              <div className="text-green-500 font-bold text-lg">+{formatUsd(ledgerTotals.inflow)}</div>
            </div>
            <div className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-xl p-3">
              <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Outflow</div>
              <div className="text-white font-bold text-lg">-{formatUsd(ledgerTotals.outflow)}</div>
            </div>
          </div>
          {ledgerSource ? (
            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              Source: {ledgerSource}
            </div>
          ) : null}
          <AdminTable
            headers={["Date", "Dir", "Token", "Amount", "Counterparty", "TX"]}
            pagination={ledgerPagination}
            onPageChange={(p) => ledgerWallet && loadLedger(ledgerWallet, p, ledgerLimit)}
            onPageSizeChange={(size) => {
              setLedgerLimit(size);
              if (ledgerWallet) loadLedger(ledgerWallet, 1, size);
            }}
          >
            {ledgerLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500 text-sm">Loading ledger...</td>
              </tr>
            ) : ledgerRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500 text-sm">No ledger entries</td>
              </tr>
            ) : (
              ledgerRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-xs font-bold ${row.direction === "IN" ? "text-green-500" : "text-[#f50]"}`}>
                    {row.direction}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{row.token}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${row.direction === "IN" ? "text-green-500" : "text-white"}`}>
                    {row.direction === "IN" ? "+" : "-"}
                    {formatUsd(row.amount)}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-gray-500">
                    {row.counterparty ? `${row.counterparty.slice(0, 6)}…${row.counterparty.slice(-4)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-gray-500">
                    {row.txHash ? `${row.txHash.slice(0, 8)}…` : "—"}
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        </div>
      </AdminModal>
    </>
  );
}

function UsersTabContent({
  onUpgradeClick,
  onPatchUserReady,
  notify,
}: {
  onUpgradeClick: (user: AdminUser) => void;
  onPatchUserReady: (patchUser: (username: string, tier: string, rank: string) => void) => void;
  notify: (type: "success" | "error" | "info", message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [limit, setLimit] = useState(20);

  const load = useCallback(
    async (page = 1, searchTerm = query, pageLimit = limit) => {
      setLoading(true);
      try {
        const data = await adminApi.getUsers({ search: searchTerm, page, limit: pageLimit });
        setUsers(data.items);
        setPagination(data.pagination);
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [query, limit, notify],
  );

  const patchUser = useCallback((username: string, tier: string, rank: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.username === username ? { ...u, tier, rank } : u)),
    );
  }, []);

  useEffect(() => {
    onPatchUserReady(patchUser);
  }, [onPatchUserReady, patchUser]);

  useEffect(() => {
    load(1, query, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setQuery(search), load(1, search))}
          placeholder="Search users..."
          className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]"
        />
        <button
          onClick={() => {
            setQuery(search);
            load(1, search);
          }}
          className="bg-[#f50] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#ff6600] transition-colors"
        >
          Search
        </button>
      </div>

      <AdminTable
        headers={["User", "Tier", "Rank", "Team Vol", "Directs", "Downlines", "Status", "Actions"]}
        pagination={pagination}
        onPageChange={(p) => load(p, query, limit)}
        onPageSizeChange={(size) => {
          setLimit(size);
          load(1, query, size);
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading users...
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
              No users found
            </td>
          </tr>
        ) : (
          users.map((u) => (
            <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-bold">{u.username}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {u.walletAddress ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-3)}` : "—"}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium">{u.tier}</td>
              <td className="px-6 py-4 text-sm text-gray-400">{u.rank}</td>
              <td className="px-6 py-4 text-sm text-white font-bold">{formatUsd(u.teamVolume)}</td>
              <td className="px-6 py-4 text-sm text-gray-400 font-bold">{u.directs}</td>
              <td className="px-6 py-4 text-sm text-gray-400 font-bold">{u.downlines}</td>
              <td className="px-6 py-4">
                <StatusBadge status={u.status.toUpperCase()} />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpgradeClick(u)}
                    className="p-2 hover:bg-[#222] rounded-lg border border-[#222] transition-colors"
                    title="Upgrade Profile"
                  >
                    ↑
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (u.isBlocked) {
                          await adminApi.unblockUser(u.username);
                          notify("success", `${u.username} unblocked.`);
                        } else {
                          await adminApi.blockUser(u.username);
                          notify("success", `${u.username} blocked.`);
                        }
                        load(pagination?.page ?? 1, query, limit);
                      } catch (err) {
                        notify("error", err instanceof AdminApiError ? err.message : "Action failed");
                      }
                    }}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg border border-[#222] transition-colors"
                    title="Block/Unblock"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

function TransactionsTabContent({ notify }: { notify: (type: "success" | "error" | "info", message: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [limit, setLimit] = useState(20);

  const load = useCallback(
    async (page = 1, type = filter, pageLimit = limit) => {
      setLoading(true);
      try {
        const data = await adminApi.getTransactions({ type, page, limit: pageLimit });
        setRows(data.items);
        setPagination(data.pagination);
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    },
    [filter, limit, notify],
  );

  useEffect(() => {
    load(1, filter, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, limit]);

  const typeLabel = (t: string) => {
    if (t === "COMPANY_WALLET_WITHDRAWN") return "Admin Withdrawal";
    if (t === "PURCHASE") return "Purchase";
    if (t === "UPGRADE") return "Upgrade";
    if (t.includes("WITHDRAW") || t === "COMMISSION_CLAIM") return "Withdrawal";
    return "Commission";
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-[#111] rounded-xl border border-[#222] w-fit">
        {["all", "commissions", "purchases", "withdrawals"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === f ? "bg-[#f50] text-white shadow-lg shadow-orange-500/10" : "text-gray-500 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AdminTable
        headers={["Date", "User", "Type", "Amount", "HNTR Points", "TX Hash", "Status"]}
        pagination={pagination}
        onPageChange={(p) => load(p, filter, limit)}
        onPageSizeChange={(size) => {
          setLimit(size);
          load(1, filter, size);
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading transactions...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
              No transactions found
            </td>
          </tr>
        ) : (
          rows.map((tx) => (
            <tr key={tx.id} className="hover:bg-[#1a1a1a] transition-colors">
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm font-bold">{tx.user}</td>
              <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">{typeLabel(tx.type)}</td>
              <td className={`px-6 py-4 text-sm font-bold ${transactionAmountColor(typeLabel(tx.type))}`}>
                {isWithdrawalTransactionType(typeLabel(tx.type)) ? "-" : "+"}
                {formatUsd(tx.amount)}
              </td>
              <td className="px-6 py-4 text-sm text-white font-mono">
                {tx.hntrPoints != null ? `+${tx.hntrPoints.toLocaleString()} Pts` : "—"}
              </td>
              <td className="px-6 py-4 text-xs font-mono text-gray-500">{tx.txHash ? `${tx.txHash.slice(0, 6)}...${tx.txHash.slice(-3)}` : "—"}</td>
              <td className="px-6 py-4">
                <StatusBadge status={tx.status} />
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

function UnclaimedTabContent({
  notify,
  onTotalChange,
}: {
  notify: (type: "success" | "error" | "info", message: string) => void;
  onTotalChange?: (total: number) => void;
}) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectWallet } = useConnectWallet();

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<"USDT" | "USDC">("USDT");
  const [claimFilter, setClaimFilter] = useState<OverdueClaimFilter>("all");
  const [rows, setRows] = useState<OverdueWallet[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [limit, setLimit] = useState(10);
  const [totalUnclaimed, setTotalUnclaimed] = useState(0);
  const [counts, setCounts] = useState({ all: 0, never: 0, overdue_30d: 0 });
  const [companyWallet, setCompanyWallet] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const connectedIsCompany =
    !!address && !!companyWallet && address.toLowerCase() === companyWallet.toLowerCase();

  useEffect(() => {
    // Never reuse member wallet JWT while operating company-wallet withdraws.
    clearStoredAuth();
  }, []);

  const load = async (
    page = 1,
    nextToken = token,
    pageLimit = limit,
    nextFilter = claimFilter,
  ) => {
    setLoading(true);
    try {
      const [data, company] = await Promise.all([
        adminApi.getOverdueCommissions(nextToken, page, pageLimit, nextFilter),
        adminApi.getCompanyWallet().catch(() => null),
      ]);
      setRows(data.items || []);
      setPagination(data.pagination);
      const total = data.totalUnclaimedUSD || 0;
      setTotalUnclaimed(total);
      onTotalChange?.(total);
      if (data.counts) setCounts(data.counts);
      if (data.companyWallet) setCompanyWallet(data.companyWallet);
      else if (company?.address) setCompanyWallet(company.address);
      if (data.tokenAddress) setTokenAddress(data.tokenAddress);
      else setTokenAddress(TOKEN_ADDRESSES[nextToken] || "");
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load overdue wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, token, limit, claimFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, claimFilter]);

  const ensureCompanyWallet = async () => {
    clearStoredAuth();
    if (!companyWallet) {
      throw new Error("On-chain company wallet address is unknown.");
    }
    let connected = address;
    if (!isConnected || !connected) {
      connected = await connectWallet();
    }
    if (connected.toLowerCase() !== companyWallet.toLowerCase()) {
      throw new Error(
        `Connected ${connected.slice(0, 6)}…${connected.slice(-4)} is not the company wallet (${companyWallet.slice(0, 6)}…${companyWallet.slice(-4)}). Switch account in your wallet.`,
      );
    }
    return connected;
  };

  const withdrawOne = async (userWallet: string, amount: number) => {
    const tokenAddr = (tokenAddress || TOKEN_ADDRESSES[token]) as `0x${string}`;
    if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured.");
    if (!tokenAddr) throw new Error(`${token} token address is not configured.`);

    await ensureCompanyWallet();

    const txHash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: hntrMembershipAbi,
      functionName: "withdrawCompanyWallet",
      args: [userWallet as `0x${string}`, tokenAddr],
    });
    await waitForTransactionReceipt(config, { hash: txHash });

    await adminApi.recordCompanyWithdraw({
      walletAddress: userWallet,
      token: tokenAddr,
      txHash,
      amount,
    });

    return txHash;
  };

  const handleWithdraw = async (row: OverdueWallet) => {
    setWithdrawing(row.walletAddress);
    try {
      const txHash = await withdrawOne(row.walletAddress, row.unclaimedUSD);
      notify("success", `Admin withdrawal recorded · ${txHash.slice(0, 10)}…`);
      await load(pagination?.page || 1, token, limit, claimFilter);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setWithdrawing(null);
    }
  };

  const handleWithdrawAll = async () => {
    if (rows.length === 0) return;
    setBulkLoading(true);
    let succeeded = 0;
    let failed = 0;
    try {
      await ensureCompanyWallet();
      for (const row of rows) {
        try {
          await withdrawOne(row.walletAddress, row.unclaimedUSD);
          succeeded += 1;
        } catch {
          failed += 1;
        }
      }
      notify(
        succeeded > 0 ? "success" : "error",
        `Withdrew ${succeeded} wallet(s)${failed ? `, ${failed} failed` : ""}.`,
      );
      await load(1, token, limit, claimFilter);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Bulk withdraw failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const statusLabel = (status?: OverdueWallet["claimStatus"]) => {
    if (status === "never") return "Never claimed";
    if (status === "overdue_30d") return "30d+ overdue";
    return "—";
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Unclaimed Wallets</h3>
          <p className="text-xs text-gray-500 mt-1">
            Connect the <span className="text-gray-300 font-bold">company wallet</span> via ConnectKit to sign{" "}
            <span className="font-mono text-gray-400">withdrawCompanyWallet</span> (member auth is cleared).
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ConnectKitButton.Custom>
            {({ isConnected: ckConnected, show, truncatedAddress, ensName }) => (
              <button
                onClick={async () => {
                  clearStoredAuth();
                  if (ckConnected) {
                    show?.();
                    return;
                  }
                  try {
                    await connectWallet();
                  } catch (err) {
                    notify("error", err instanceof Error ? err.message : "Wallet connect failed");
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  connectedIsCompany
                    ? "bg-green-500/10 border-green-500/40 text-green-400"
                    : ckConnected
                      ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                      : "bg-[#1a1a1a] border-[#333] text-white hover:border-[#f50]"
                }`}
              >
                {connectedIsCompany
                  ? `Company · ${ensName ?? truncatedAddress}`
                  : ckConnected
                    ? `Wrong wallet · ${ensName ?? truncatedAddress}`
                    : "Connect Company Wallet"}
              </button>
            )}
          </ConnectKitButton.Custom>
          {isConnected ? (
            <button
              onClick={() => {
                disconnect();
                clearStoredAuth();
              }}
              className="px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-[10px] font-bold text-gray-400 hover:text-white"
            >
              Disconnect
            </button>
          ) : null}
          <div className="flex bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            {(["USDT", "USDC"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setToken(t)}
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  token === t ? "bg-[#f50] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(pagination?.page || 1, token, limit, claimFilter)}
            disabled={loading || !!withdrawing || bulkLoading}
            className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-xs font-bold disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={handleWithdrawAll}
            disabled={loading || bulkLoading || !!withdrawing || rows.length === 0 || !connectedIsCompany}
            className="px-4 py-2 rounded-xl bg-[#f50] text-xs font-bold disabled:opacity-50"
          >
            {bulkLoading ? "Withdrawing..." : "Withdraw Page"}
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            On-chain company wallet
          </span>
          <span className="text-xs font-mono text-gray-300">
            {companyWallet ? `${companyWallet.slice(0, 10)}…${companyWallet.slice(-8)}` : "Loading…"}
          </span>
        </div>
        {!connectedIsCompany ? (
          <p className="text-[11px] text-yellow-500/90">
            Connect the company wallet above before withdrawing. Member wallet auth tokens are cleared on this page.
          </p>
        ) : (
          <p className="text-[11px] text-green-500/90">Company wallet connected — withdraws will be signed in your wallet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all" as const, label: "All", count: counts.all },
            { key: "never" as const, label: "Never claimed", count: counts.never },
            { key: "overdue_30d" as const, label: "30d+ overdue", count: counts.overdue_30d },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setClaimFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              claimFilter === f.key
                ? "bg-[#f50]/10 border-[#f50] text-[#f50]"
                : "bg-[#111] border-[#222] text-gray-400 hover:text-white"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-4 flex justify-between items-center">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Total Unclaimed ({token}
          {claimFilter !== "all" ? ` · ${claimFilter === "never" ? "never claimed" : "30d+"}` : ""})
        </span>
        <span className="text-xl font-bold text-green-500">{formatUsd(totalUnclaimed)}</span>
      </div>

      <AdminTable
        headers={["User", "Wallet", "Status", "Last Claim", "Unclaimed", "Action"]}
        pagination={pagination}
        onPageChange={(p) => load(p, token, limit, claimFilter)}
        onPageSizeChange={(size) => {
          setLimit(size);
          load(1, token, size, claimFilter);
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
              Loading overdue wallets from chain...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
              No overdue wallets found
            </td>
          </tr>
        ) : (
          rows.map((w) => (
            <tr key={w.walletAddress} className="hover:bg-[#1a1a1a] transition-colors">
              <td className="px-6 py-4 text-sm font-bold">{w.username}</td>
              <td className="px-6 py-4 text-xs font-mono text-gray-500">
                {w.walletAddress.slice(0, 6)}…{w.walletAddress.slice(-4)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    w.claimStatus === "never"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-[#f50]/10 text-[#f50]"
                  }`}
                >
                  {statusLabel(w.claimStatus)}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                {w.claimStatus === "never"
                  ? "—"
                  : w.daysSinceClaim != null
                    ? `${w.daysSinceClaim}d ago`
                    : w.lastClaimedAt
                      ? new Date(w.lastClaimedAt).toLocaleDateString()
                      : "—"}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-green-500">{formatUsd(w.unclaimedUSD)}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleWithdraw(w)}
                  disabled={!!withdrawing || bulkLoading || !connectedIsCompany}
                  className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#f50] hover:text-[#f50] text-xs font-bold transition-all disabled:opacity-50"
                >
                  {withdrawing === w.walletAddress ? "Withdrawing..." : "Withdraw"}
                </button>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
