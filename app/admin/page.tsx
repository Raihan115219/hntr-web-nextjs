"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminCard,
  AdminTable,
  StatusBadge,
  AdminModal,
  useNotifications,
  NotificationPortal,
  AdminPagination,
} from "@/components/admin/UI";
import {
  adminApi,
  AdminApiError,
  AdminUser,
  AdminTransaction,
  AdminWalletBalance,
  AdminActivity,
  LeadershipPreview,
  OverdueWallet,
  PaginationMeta,
  formatUsd,
} from "@/lib/admin/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { notifications, notify } = useNotifications();

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricCards, setMetricCards] = useState<{ title: string; value: string | number; subValue?: string }[]>([]);

  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const [leadershipPreview, setLeadershipPreview] = useState<LeadershipPreview | null>(null);
  const [overdueWallets, setOverdueWallets] = useState<OverdueWallet[]>([]);
  const [overduePagination, setOverduePagination] = useState<PaginationMeta | null>(null);
  const [overdueLimit, setOverdueLimit] = useState(10);
  const [totalUnclaimed, setTotalUnclaimed] = useState(0);
  const [selectedOverdue, setSelectedOverdue] = useState<Set<string>>(new Set());
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [upgradeTier, setUpgradeTier] = useState("");
  const [upgradeRank, setUpgradeRank] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
      await adminApi.distributeLeadership();
      setIsLeadershipModalOpen(false);
      notify("success", "Leadership rewards distributed successfully.");
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

  const loadOverduePage = async (page = 1, limit = overdueLimit) => {
    setActionLoading(true);
    try {
      const data = await adminApi.getOverdueCommissions("USDT", page, limit);
      setOverdueWallets(data.items || []);
      setOverduePagination(data.pagination);
      setTotalUnclaimed(data.totalUnclaimedUSD || 0);
      setSelectedOverdue((prev) => {
        const next = new Set(prev);
        (data.items || []).forEach((w) => next.add(w.walletAddress));
        return next;
      });
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load overdue commissions");
    } finally {
      setActionLoading(false);
    }
  };

  const openClaimModal = async () => {
    setIsClaimModalOpen(true);
    await loadOverduePage(1, overdueLimit);
  };

  const handleClaimCommissions = async () => {
    const addresses = [...selectedOverdue];
    if (addresses.length === 0) {
      notify("info", "No wallets selected.");
      return;
    }
    setActionLoading(true);
    try {
      const result = await adminApi.claimCommissions(addresses, "USDT");
      setIsClaimModalOpen(false);
      notify("success", `Processed ${(result as { succeeded: number }).succeeded} commission claim(s).`);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Claim failed");
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

      <div className="flex border-b border-[#222]">
        {["overview", "users", "transactions", "wallets"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-semibold capitalize transition-all relative ${
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
            setUpgradeTier(user.tier);
            setUpgradeRank(user.rank);
            setIsUpgradeModalOpen(true);
          }}
          notify={notify}
        />
      )}
      {activeTab === "transactions" && <TransactionsTabContent notify={notify} />}
      {activeTab === "wallets" && <WalletsTabContent notify={notify} />}

      <div className="space-y-6">
        <h3 className="text-lg font-bold">Quick Controls</h3>
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4 max-w-md">
          <button
            onClick={openLeadershipModal}
            disabled={actionLoading}
            className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            Distribute Leadership Monthly
          </button>
          <div className="space-y-2">
            <button
              onClick={openClaimModal}
              disabled={actionLoading}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              Claim Unclaimed Commissions
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

      <AdminModal isOpen={isLeadershipModalOpen} onClose={() => setIsLeadershipModalOpen(false)} title="Distribute Leadership Rewards">
        <div className="space-y-6">
          <p className="text-gray-400 text-sm leading-relaxed">
            This will calculate and distribute the monthly leadership pool shares to all eligible Hunter ranks and above.
          </p>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-500 font-bold uppercase">Pool Balance</span>
              <span className="text-sm font-bold text-white">{formatUsd(leadershipPreview?.poolBalanceUSD ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Eligible Users</span>
              <span className="text-sm font-bold text-white">{leadershipPreview?.eligibleCount ?? 0} Hunters</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsLeadershipModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-[#222] text-sm font-bold">
              Cancel
            </button>
            <button
              onClick={handleDistributeLeadership}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 rounded-xl bg-[#f50] text-sm font-bold disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Confirm Distribution"}
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} title="Process Unclaimed Commissions">
        <div className="space-y-6">
          {overdueWallets.length === 0 && !actionLoading ? (
            <p className="text-gray-400 text-sm text-center py-4">No overdue wallets found.</p>
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <AdminTable headers={["User", "Unclaimed", "Select"]}>
                {actionLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-gray-500 text-sm">Loading...</td>
                  </tr>
                ) : (
                  overdueWallets.map((u) => (
                    <tr key={u.walletAddress} className="hover:bg-[#1a1a1a]">
                      <td className="px-6 py-3 text-sm font-bold">{u.username}</td>
                      <td className="px-6 py-3 text-sm text-green-500 font-bold">{formatUsd(u.unclaimedUSD)}</td>
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOverdue.has(u.walletAddress)}
                          onChange={(e) => {
                            const next = new Set(selectedOverdue);
                            if (e.target.checked) next.add(u.walletAddress);
                            else next.delete(u.walletAddress);
                            setSelectedOverdue(next);
                          }}
                          className="accent-[#f50]"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </AdminTable>
              {overduePagination && (
                <AdminPagination
                  pagination={overduePagination}
                  onPageChange={(p) => loadOverduePage(p, overdueLimit)}
                  onPageSizeChange={(limit) => {
                    setOverdueLimit(limit);
                    loadOverduePage(1, limit);
                  }}
                />
              )}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setIsClaimModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-[#222] text-sm font-bold">
              Cancel
            </button>
            <button
              onClick={handleClaimCommissions}
              disabled={actionLoading || overdueWallets.length === 0}
              className="flex-1 px-6 py-3 rounded-xl bg-[#f50] text-sm font-bold disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Claim Selected"}
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
                await adminApi.overrideUser(selectedUser.username, upgradeTier, upgradeRank);
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
            <td className={`px-6 py-4 text-sm font-bold ${row.type.includes("Commission") ? "text-green-500" : "text-[#f50]"}`}>
              {row.type.includes("Withdrawal") ? "-" : "+"}
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
  const [ledgerRows, setLedgerRows] = useState<{ id: string; type: string; amount: number; token?: string; timestamp: string; txHash?: string }[]>([]);
  const [ledgerPagination, setLedgerPagination] = useState<PaginationMeta | null>(null);
  const [ledgerLimit, setLedgerLimit] = useState(10);

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
    try {
      const data = await adminApi.getWalletLedger(wallet.key, page, limit);
      setLedgerRows(data.items as typeof ledgerRows);
      setLedgerPagination(data.pagination);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to load ledger");
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
                {w.balance.toLocaleString()} <span className="text-xs text-[#f50]">{w.symbol}</span>
              </div>
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
        <AdminTable
          headers={["Date", "Type", "Amount", "TX Hash"]}
          pagination={ledgerPagination}
          onPageChange={(p) => ledgerWallet && loadLedger(ledgerWallet, p, ledgerLimit)}
          onPageSizeChange={(size) => {
            setLedgerLimit(size);
            if (ledgerWallet) loadLedger(ledgerWallet, 1, size);
          }}
        >
          {ledgerRows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-6 text-center text-gray-500 text-sm">No ledger entries</td>
            </tr>
          ) : (
            ledgerRows.map((row) => (
              <tr key={row.id} className="hover:bg-[#1a1a1a]">
                <td className="px-6 py-3 text-xs text-gray-500">{new Date(row.timestamp).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm">{row.type}</td>
                <td className="px-6 py-3 text-sm font-bold">{formatUsd(row.amount)}</td>
                <td className="px-6 py-3 text-xs font-mono text-gray-500">
                  {row.txHash ? `${row.txHash.slice(0, 8)}...` : "—"}
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </AdminModal>
    </>
  );
}

function UsersTabContent({
  onUpgradeClick,
  notify,
}: {
  onUpgradeClick: (user: AdminUser) => void;
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
                <div className="text-[10px] text-gray-500 font-mono">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-3)}</div>
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
              <td
                className={`px-6 py-4 text-sm font-bold ${
                  typeLabel(tx.type) === "Withdrawal" ? "text-white" : typeLabel(tx.type) === "Purchase" ? "text-[#f50]" : "text-green-500"
                }`}
              >
                {typeLabel(tx.type) === "Withdrawal" ? "-" : "+"}
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
