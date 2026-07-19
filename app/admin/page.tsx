"use client";

import { useState } from "react";
import { 
  AdminCard, 
  AdminTable, 
  StatusBadge, 
  AdminModal, 
  useNotifications, 
  NotificationPortal 
} from "@/components/admin/UI";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { notifications, notify } = useNotifications();
  
  // Modal states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock data
  const metrics = [
    { title: "Total Users", value: "1,284", subValue: "+12% this month" },
    { title: "Total Volume", value: "$4.2M", subValue: "+8% this month" },
    { title: "Total Commissions", value: "$2.73M", subValue: "65% distribution" },
    { title: "Treasury Balance", value: "$1.05M", subValue: "25% company cut" },
    { title: "Sold Memberships", value: "3,412", subValue: "All tiers" },
  ];

  const walletBalances = [
    { name: "Achievement Wallet", symbol: "USDT", balance: 125000, address: "0x123...abc" },
    { name: "Leadership Wallet", symbol: "USDC", balance: 85400, address: "0x456...def" },
    { name: "Pool Wallet", symbol: "USDT", balance: 142500, address: "0x789...ghi" },
    { name: "Company Wallet", symbol: "USDT", balance: 512000, address: "0xabc...123" },
    { name: "Treasury Wallet", symbol: "USDC", balance: 1050000, address: "0xdef...456" },
  ];

  const handleDistributeLeadership = () => {
    setIsLeadershipModalOpen(false);
    notify("success", "Leadership rewards distributed successfully to all eligible ranks.");
  };

  const handleClaimCommissions = () => {
    setIsClaimModalOpen(false);
    notify("success", "Unclaimed commissions processed for selected users.");
  };

  return (
    <div className="space-y-10">
      <NotificationPortal notifications={notifications} />

      {/* Platform Metrics */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white/90">Platform Metrics</h2>
          <div className="text-xs text-gray-500 font-medium bg-[#111] px-3 py-1 rounded-full border border-[#222]">Live Statistics</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((m, i) => (
            <AdminCard key={i} {...m} />
          ))}
        </div>
      </section>

      {/* Tabs */}
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
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f50]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AdminTable headers={["Type", "User", "Amount", "Status"]} title="Recent Network Activity">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                    {i % 2 === 0 ? "Commission Earned" : "Membership Purchase"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">user_{i}99</td>
                  <td className={`px-6 py-4 text-sm font-bold ${i % 2 === 0 ? "text-green-500" : "text-[#f50]"}`}>
                    {i % 2 === 0 ? "+" : ""}${ (120 * i).toLocaleString() }.00
                  </td>
                  <td className="px-6 py-4 text-sm"><StatusBadge status="CONFIRMED" /></td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold">Quick Controls</h3>
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
              <button 
                onClick={() => setIsLeadershipModalOpen(true)}
                className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all"
              >
                Distribute Leadership Monthly
              </button>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsClaimModalOpen(true)}
                  className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-xl text-sm font-bold transition-all"
                >
                  Claim Unclaimed Commissions
                </button>
                <div className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-wider">
                  $42,850.00 Unclaimed Pending
                </div>
              </div>
              <button className="w-full border border-[#f50]/10 text-[#f50]/60 hover:text-[#f50] hover:bg-[#f50]/5 py-3 rounded-xl text-sm font-bold transition-all">
                System Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <UsersTabContent 
          onUpgradeClick={(user) => {
            setSelectedUser(user);
            setIsUpgradeModalOpen(true);
          }}
          notify={notify}
        />
      )}
      {activeTab === "transactions" && <TransactionsTabContent />}
      {activeTab === "wallets" && <WalletsTabContent walletBalances={walletBalances} />}

      {/* Modals */}
      <AdminModal 
        isOpen={isLeadershipModalOpen} 
        onClose={() => setIsLeadershipModalOpen(false)} 
        title="Distribute Leadership Rewards"
      >
        <div className="space-y-6">
          <p className="text-gray-400 text-sm leading-relaxed">
            This will calculate and distribute the monthly leadership pool shares to all eligible Hunter ranks and above. This action is irreversible once confirmed on-chain.
          </p>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222]">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-500 font-bold uppercase">Pool Balance</span>
              <span className="text-sm font-bold text-white">$85,400.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Eligible Users</span>
              <span className="text-sm font-bold text-white">42 Hunters</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsLeadershipModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-[#222] text-sm font-bold">Cancel</button>
            <button onClick={handleDistributeLeadership} className="flex-1 px-6 py-3 rounded-xl bg-[#f50] text-sm font-bold">Confirm Distribution</button>
          </div>
        </div>
      </AdminModal>

      <AdminModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)} 
        title="Process Unclaimed Commissions"
      >
        <div className="space-y-6">
          <AdminTable headers={["User", "Unclaimed", "Select"]}>
            {[
              { user: "cryptoking", amount: "$12,400" },
              { user: "nftninja", amount: "$8,250" },
              { user: "web3dev", amount: "$3,100" },
            ].map((u, i) => (
              <tr key={i} className="hover:bg-[#1a1a1a]">
                <td className="px-6 py-3 text-sm font-bold">{u.user}</td>
                <td className="px-6 py-3 text-sm text-green-500 font-bold">{u.amount}</td>
                <td className="px-6 py-3">
                  <input type="checkbox" defaultChecked className="accent-[#f50]" />
                </td>
              </tr>
            ))}
          </AdminTable>
          <div className="flex gap-3">
            <button onClick={() => setIsClaimModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl bg-[#222] text-sm font-bold">Cancel</button>
            <button onClick={handleClaimCommissions} className="flex-1 px-6 py-3 rounded-xl bg-[#f50] text-sm font-bold">Claim Selected</button>
          </div>
        </div>
      </AdminModal>

      <AdminModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        title={`Upgrade Profile: ${selectedUser?.user || "User"}`}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target Membership</label>
              <select className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]">
                <option>{selectedUser?.tier} (Current)</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>Platinum</option>
                <option>Diamond</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Override Rank</label>
              <select className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]">
                <option>{selectedUser?.rank} (Current)</option>
                <option>Scout</option>
                <option>Tracker</option>
                <option>Ranger</option>
                <option>Hunter</option>
                <option>Elite Hunter</option>
                <option>Master Hunter</option>
                <option>Legend Hunter</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsUpgradeModalOpen(false);
              notify("success", `User ${selectedUser?.user} upgraded successfully.`);
            }} 
            className="w-full bg-[#f50] py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10"
          >
            Confirm Upgrades
          </button>
        </div>
      </AdminModal>
    </div>
  );
}

function WalletsTabContent({ walletBalances }: { walletBalances: any[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {walletBalances.map((w, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-8 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{w.name}</h4>
                <div className="text-3xl font-bold">{w.balance.toLocaleString()} <span className="text-xs text-[#f50]">{w.symbol}</span></div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#222]">
              <div className="text-[10px] text-gray-600 font-mono mb-4 break-all">{w.address}</div>
              <button className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] py-2 rounded-lg text-xs font-bold transition-all">
                View Ledger
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTabContent({ onUpgradeClick, notify }: { onUpgradeClick: (user: any) => void, notify: any }) {
  const [search, setSearch] = useState("");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..." 
          className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f50]"
        />
        <button className="bg-[#f50] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#ff6600] transition-colors">Search</button>
      </div>

      <AdminTable headers={["User", "Tier", "Rank", "Team Vol", "Directs", "Downlines", "Status", "Actions"]}>
        {[
          { user: "cryptoking", tier: "Diamond", rank: "Master Hunter", vol: "$5.2M", directs: 42, downlines: 1280, status: "Active" },
          { user: "nftninja", tier: "Gold", rank: "Ranger", vol: "$52,400", directs: 12, downlines: 145, status: "Active" },
          { user: "badactor", tier: "Bronze", rank: "Scout", vol: "$1,200", directs: 2, downlines: 5, status: "Blocked" },
        ].map((u, i) => (
          <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
            <td className="px-6 py-4">
              <div className="text-sm font-bold">{u.user}</div>
              <div className="text-[10px] text-gray-500 font-mono">0x71C...aB2</div>
            </td>
            <td className="px-6 py-4 text-sm font-medium">{u.tier}</td>
            <td className="px-6 py-4 text-sm text-gray-400">{u.rank}</td>
            <td className="px-6 py-4 text-sm text-white font-bold">{u.vol}</td>
            <td className="px-6 py-4 text-sm text-gray-400 font-bold">{u.directs}</td>
            <td className="px-6 py-4 text-sm text-gray-400 font-bold">{u.downlines}</td>
            <td className="px-6 py-4"><StatusBadge status={u.status.toUpperCase()} /></td>
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
                  onClick={() => notify("info", "User block status updated.")}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg border border-[#222] transition-colors" 
                  title="Block/Unblock"
                >
                  ✕
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

function TransactionsTabContent() {
  const [filter, setFilter] = useState("all");

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

      <AdminTable headers={["Date", "User", "Type", "Amount", "HNTR Points", "TX Hash", "Status"]}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
            <td className="px-6 py-4 text-xs text-gray-500">2026-07-19 14:32</td>
            <td className="px-6 py-4 text-sm font-bold">user_{i}2</td>
            <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {i % 3 === 0 ? "Withdrawal" : i % 2 === 0 ? "Purchase" : "Commission"}
            </td>
            <td className={`px-6 py-4 text-sm font-bold ${i % 3 === 0 ? "text-white" : i % 2 === 0 ? "text-[#f50]" : "text-green-500"}`}>
              {i % 3 === 0 ? "-" : "+"}${ (150 * i).toLocaleString() }
            </td>
            <td className="px-6 py-4 text-sm text-white font-mono">
              +{(15 * i).toLocaleString()} Pts
            </td>
            <td className="px-6 py-4 text-xs font-mono text-gray-500">0xabc...123</td>
            <td className="px-6 py-4"><StatusBadge status="CONFIRMED" /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
