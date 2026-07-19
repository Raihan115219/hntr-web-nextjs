"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple placeholder logic for gating
    if (password === "hntr-admin-2026") {
      // In a real app, we would authenticate with the backend
      window.localStorage.setItem("hntr_auth", JSON.stringify({
        token: "admin-token",
        walletAddress: "0xADMIN",
        expiresAt: Date.now() + 3600000
      }));
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/assets/images/logoMark.png" alt="HNTR" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 mt-2 text-sm">Enter password to access dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f50] transition-colors"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#f50] hover:bg-[#ff6600] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-[#222] text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Back to Application
          </button>
        </div>
      </div>
    </div>
  );
}
