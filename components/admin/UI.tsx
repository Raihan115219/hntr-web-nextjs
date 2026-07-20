import React, { useEffect, useState } from "react";

export function AdminCard({ title, value, subValue, icon }: { title: string, value: string | number, subValue?: string, icon?: string }) {
  return (
    <div className="bg-[#111] border border-[#222] p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <span className="text-xl opacity-50">{icon}</span>}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {subValue && <span className="text-sm text-green-500 mt-1 font-medium">{subValue}</span>}
      </div>
    </div>
  );
}

export function AdminTable({
  headers,
  children,
  title,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  headers: string[];
  children: React.ReactNode;
  title?: string;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
      {title && (
        <div className="px-6 py-4 border-b border-[#222]">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-[#222]">
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">{children}</tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <AdminPagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function AdminPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}) {
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-[#222] bg-[#0d0d0d]">
      <span className="text-xs text-gray-500">
        {pagination.total === 0
          ? "No results"
          : `Showing ${start}–${end} of ${pagination.total} · Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
      </span>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <select
            value={pagination.limit}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#f50]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#333] disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            Prev
          </button>
          <button
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#333] disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-green-500/10 text-green-500",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    FAILED: "bg-red-500/10 text-red-500",
    OPEN: "bg-blue-500/10 text-blue-500",
    CLOSED: "bg-gray-500/10 text-gray-500",
    COMPLETED: "bg-purple-500/10 text-purple-500",
    ACTIVE: "bg-green-500/10 text-green-500",
    BLOCKED: "bg-red-500/10 text-red-500",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${styles[status] || "bg-gray-500/10 text-gray-500"}`}>
      {status}
    </span>
  );
}

export function AdminModal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#111] border border-[#222] rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = React.useCallback((type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => {
      if (prev.some((n) => n.type === type && n.message === message)) return prev;
      return [...prev, { id, type, message }];
    });
    setTimeout(() => {
      setNotifications((current) => current.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return { notifications, notify };
}

export function NotificationPortal({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto ${
            n.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
            n.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
            "bg-blue-500/10 border-blue-500/20 text-blue-500"
          }`}
        >
          <span className="text-xl">
            {n.type === "success" ? "✓" : n.type === "error" ? "⚠" : "ℹ"}
          </span>
          <span className="font-semibold text-sm">{n.message}</span>
        </div>
      ))}
    </div>
  );
}
