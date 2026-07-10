import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, CheckCircle, Loader2, FileText, AlertTriangle, User, QrCode } from "lucide-react";
import jsQR from "jsqr";

export default function AdminDeposit() {
  // @ts-ignore
  const users = useQuery(api.users.listUsers);
  // @ts-ignore
  const sponsorDeposit = useMutation(api.recharges.sponsorDeposit);

  // Auto-read userId from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedUserId = urlParams.get("userId") || "";

  // Per-crypto, per-network platform deposit addresses (must match RechargeDetails.tsx)
  const PLATFORM_ADDRESSES: Record<string, Record<string, string>> = {
    USDT: {
      TRC20: "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7",
      ERC20: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      ETH:   "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    ETH: {
      TRC20: "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7",
      ERC20: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
      ETH:   "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    },
    USDC: {
      TRC20: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
      ERC20: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      ETH:   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
  };

  const [targetUserId, setTargetUserId] = useState(preselectedUserId);
  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [amountStr, setAmountStr] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // Dynamic platform address configuration
  const customConfig = useQuery(api.platformAddresses.getAddress, { currency, network });
  const walletAddress = customConfig?.address || PLATFORM_ADDRESSES[currency]?.[network] || PLATFORM_ADDRESSES["USDT"]["TRC20"];
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) { setError("Canvas error."); return; }
      ctx2d.drawImage(img, 0, 0);
      const imageData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        setTargetUserId(code.data.trim());
      } else {
        setError("Could not decode any QR code. Try a clearer image.");
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setError("Failed to load image."); URL.revokeObjectURL(url); };
    img.src = url;
  };

  // Sync preselectedUserId on URL change
  useEffect(() => {
    if (preselectedUserId) setTargetUserId(preselectedUserId);
  }, [preselectedUserId]);

  const amount = parseFloat(amountStr) || 0;

  // Resolve the selected user's display info (by UID or Crypto Address)
  const resolvedUser = users?.find((u: any) => 
    u._id === targetUserId || 
    (u.depositAddresses && (
      u.depositAddresses.TRC20 === targetUserId || 
      u.depositAddresses.ERC20 === targetUserId || 
      u.depositAddresses.ETH === targetUserId
    ))
  );

  const handleSubmit = async () => {
    setError("");
    if (!resolvedUser) { setError("No valid target user found from the input/QR."); return; }
    if (amount <= 0) { setError("Please enter a valid credit amount."); return; }
    if (!walletAddress.trim()) { setError("Wallet address is required for logs."); return; }
    if (!adminPassword.trim()) { setError("Admin Fund Password is required."); return; }

    setSubmitting(true);
    try {
      await sponsorDeposit({
        targetUserId: resolvedUser._id as any,
        currency,
        network,
        walletAddress,
        amount,
        adminPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmountStr("");
        setAdminPassword("");
      }, 2000);
    } catch (e: any) {
      setError(e.message || "Sponsorship failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 flex flex-col items-center justify-center gap-4 transition-colors">
        <CheckCircle size={56} className="text-emerald-500" />
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Funds Sponsored & Credited!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Target user exchange balance updated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900 dark:text-white">Admin Sponsored Deposit</h1>
        <a href="/admin/deposit-logs" className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <FileText size={20} className="text-gray-500 dark:text-gray-400" />
        </a>
      </header>

      <div className="p-5 flex flex-col gap-5 mt-2">
        {/* Warning card */}
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            Strict Admin Action. Sponsoring a deposit will instantly credit the recipient's main Exchange wallet total. Requires your Fund Password to authorize.
          </p>
        </div>

        {/* Target User Input & Card */}
        <div>
          <div className="flex items-center justify-between mb-2">
             <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target App User</label>
             <button onClick={() => fileRef.current?.click()} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                <QrCode size={14} /> Scan/Upload QR
             </button>
          </div>
          
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleQrUpload} />

          <input
            type="text"
            placeholder="Enter or scan target user ID..."
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm mb-3 font-mono"
          />

          {resolvedUser ? (
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-sm animate-slide-in">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {resolvedUser.name || (resolvedUser.isAnonymous ? "Guest" : "Unnamed User")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resolvedUser.email || resolvedUser.phone || "No contact"}</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {resolvedUser.role || "user"}
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ Target user not found. Please input or scan a valid App User ID, or select from <a href="/admin/manage-users" className="underline font-bold">Manage Users</a>.
            </div>
          )}
        </div>

        {/* Currency & Network */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">Currency</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm"
            >
              <option value="USDT">USDT</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">Network</label>
            <select 
              value={network} 
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm"
            >
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">Credit Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-lg font-bold text-[#1860F5]"
          />
        </div>

        {/* Wallet Address (For Logs) */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">Platform Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 outline-none text-sm font-mono cursor-default"
          />
          <p className="text-[11px] text-gray-400 mt-1">Auto-filled based on currency & network. This appears on the user's recharge record.</p>
        </div>

        {/* Admin Password */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">Verify Your Fund Password</label>
          <input
            type="password"
            placeholder="Enter your fund password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !resolvedUser}
          className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />} Authorize & Deposit
        </button>
      </div>
    </div>
  );
}
