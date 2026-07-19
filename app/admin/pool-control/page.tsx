"use client";

import { useState } from "react";
import { 
  StatusBadge, 
  AdminModal, 
  useNotifications, 
  NotificationPortal 
} from "@/components/admin/UI";

export default function PoolControlPage() {
  const { notifications, notify } = useNotifications();
  const [isEditPoolModalOpen, setIsEditPoolModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);

  return (
    <div className="space-y-10">
      <NotificationPortal notifications={notifications} />
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Strategy Pool Control</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage on-chain co-investment strategy pools</p>
        </div>
        <button className="bg-[#f50] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#ff6600] transition-all shadow-lg shadow-orange-500/10">
          + Create New Pool
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Bored Ape Yacht Club", target: 35, raised: 28.5, progress: 81 },
          { name: "Pudgy Penguins", target: 8.5, raised: 4.25, progress: 50 },
          { name: "Azuki", target: 12, raised: 1.2, progress: 10 },
        ].map((p, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-base">{p.name}</h4>
              <StatusBadge status="OPEN" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-500">Capital Raised</span>
                <span className="text-white">{p.raised} / {p.target} ETH</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="h-full bg-[#f50]" style={{ width: `${p.progress}%` }} />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#222]">
              <button 
                onClick={() => {
                  setSelectedPool(p);
                  setIsEditPoolModalOpen(true);
                }}
                className="flex-1 bg-[#1a1a1a] border border-[#333] hover:bg-[#222] py-2.5 rounded-lg text-xs font-bold transition-all"
              >
                Edit Settings
              </button>
              <button className="px-4 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 py-2.5 rounded-lg text-xs font-bold transition-all">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Pool Modal */}
      <AdminModal 
        isOpen={isEditPoolModalOpen} 
        onClose={() => setIsEditPoolModalOpen(false)} 
        title={`Edit Strategy Pool: ${selectedPool?.name || "Pool"}`}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pool Name</label>
              <input type="text" defaultValue={selectedPool?.name} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#f50] outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Image URL</label>
              <input type="text" defaultValue="/assets/images/pool-default.jpg" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#f50] outline-none transition-colors" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
              <div>
                <div className="text-sm font-bold text-white">Pause Pool Deposits</div>
                <div className="text-xs text-gray-500">Temporarily stop new deposits</div>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-[#f50]" />
            </div>
          </div>
          <button 
            onClick={() => {
              setIsEditPoolModalOpen(false);
              notify("success", "Pool updated successfully.");
            }} 
            className="w-full bg-[#f50] py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10"
          >
            Save Changes
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
