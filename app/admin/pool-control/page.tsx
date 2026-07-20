"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge, AdminModal, useNotifications, NotificationPortal, AdminPagination } from "@/components/admin/UI";
import { adminApi, AdminApiError, AdminPool, PaginationMeta } from "@/lib/admin/api";

export default function PoolControlPage() {
  const { notifications, notify } = useNotifications();
  const [pools, setPools] = useState<AdminPool[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [isEditPoolModalOpen, setIsEditPoolModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<AdminPool | null>(null);

  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("/assets/images/pool-default.jpg");
  const [formTargetEth, setFormTargetEth] = useState("10");
  const [formPaused, setFormPaused] = useState(false);

  const loadPools = useCallback(
    async (nextPage = page, nextLimit = limit) => {
      setLoading(true);
      try {
        const data = await adminApi.getPools(nextPage, nextLimit);
        setPools(data.items);
        setPagination(data.pagination);
        setPage(nextPage);
      } catch (err) {
        notify("error", err instanceof AdminApiError ? err.message : "Failed to load pools");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, notify],
  );

  useEffect(() => {
    loadPools(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const openEdit = (pool: AdminPool) => {
    setSelectedPool(pool);
    setFormName(pool.name);
    setFormImageUrl(pool.imageUrl);
    setFormTargetEth(String(pool.targetEth));
    setFormPaused(pool.depositsPaused);
    setIsEditPoolModalOpen(true);
  };

  const openCreate = () => {
    setFormName("");
    setFormImageUrl("/assets/images/pool-default.jpg");
    setFormTargetEth("10");
    setFormPaused(false);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      notify("error", "Pool name is required.");
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.createPool({
        name: formName.trim(),
        targetEth: Number(formTargetEth),
        imageUrl: formImageUrl,
      });
      setIsCreateModalOpen(false);
      notify("success", "Pool created successfully.");
      loadPools(1, limit);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to create pool");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPool) return;
    setActionLoading(true);
    try {
      await adminApi.updatePool(selectedPool.id, {
        name: formName.trim(),
        imageUrl: formImageUrl,
        targetEth: Number(formTargetEth),
        depositsPaused: formPaused,
      });
      setIsEditPoolModalOpen(false);
      notify("success", "Pool updated successfully.");
      loadPools(page, limit);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to update pool");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (pool: AdminPool) => {
    if (!confirm(`Delete pool "${pool.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await adminApi.deletePool(pool.id);
      notify("success", "Pool deleted.");
      loadPools(page, limit);
    } catch (err) {
      notify("error", err instanceof AdminApiError ? err.message : "Failed to delete pool");
    } finally {
      setActionLoading(false);
    }
  };

  const PoolForm = ({ onSave, saveLabel }: { onSave: () => void; saveLabel: string }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pool Name</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#f50] outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target ETH</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formTargetEth}
            onChange={(e) => setFormTargetEth(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#f50] outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Image URL</label>
          <input
            type="text"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#f50] outline-none transition-colors"
          />
        </div>
        {selectedPool && (
          <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
            <div>
              <div className="text-sm font-bold text-white">Pause Pool Deposits</div>
              <div className="text-xs text-gray-500">Temporarily stop new deposits</div>
            </div>
            <input type="checkbox" checked={formPaused} onChange={(e) => setFormPaused(e.target.checked)} className="w-5 h-5 accent-[#f50]" />
          </div>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={actionLoading}
        className="w-full bg-[#f50] py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10 disabled:opacity-50"
      >
        {actionLoading ? "Saving..." : saveLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      <NotificationPortal notifications={notifications} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Strategy Pool Control</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage on-chain co-investment strategy pools</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#f50] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#ff6600] transition-all shadow-lg shadow-orange-500/10"
        >
          + Create New Pool
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm py-12 text-center">Loading strategy pools...</div>
      ) : pools.length === 0 ? (
        <div className="text-gray-500 text-sm py-12 text-center border border-[#222] rounded-2xl bg-[#111]">
          No strategy pools yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((p) => (
              <div key={p.id} className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base">{p.name}</h4>
                  <StatusBadge status={p.depositsPaused ? "CLOSED" : p.status} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-500">Capital Raised</span>
                    <span className="text-white">
                      {p.raisedEth} / {p.targetEth} ETH
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f50]" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#222]">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] hover:bg-[#222] py-2.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Edit Settings
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={actionLoading}
                    className="px-4 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <AdminPagination
                pagination={pagination}
                onPageChange={(p) => loadPools(p, limit)}
                onPageSizeChange={(size) => {
                  setLimit(size);
                  loadPools(1, size);
                }}
                pageSizeOptions={[9, 18, 36]}
              />
            </div>
          )}
        </div>
      )}

      <AdminModal isOpen={isEditPoolModalOpen} onClose={() => setIsEditPoolModalOpen(false)} title={`Edit Strategy Pool: ${selectedPool?.name || "Pool"}`}>
        <PoolForm onSave={handleUpdate} saveLabel="Save Changes" />
      </AdminModal>

      <AdminModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Strategy Pool">
        <PoolForm onSave={handleCreate} saveLabel="Create Pool" />
      </AdminModal>
    </div>
  );
}
