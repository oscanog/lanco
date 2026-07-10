import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Upload, Keyboard, Loader2, CheckCircle, Trash2, AlertTriangle, Wifi } from "lucide-react";
import jsQR from "jsqr";

// ── Address format detection ──
function detectNetwork(address: string): { network: string; blockchain: string } | null {
  const trimmed = address.trim();
  // TRON: starts with T, Base58, 34 chars
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    return { network: "TRC20", blockchain: "TRON" };
  }
  // Ethereum: starts with 0x, hex, 42 chars
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    return { network: "ERC20", blockchain: "Ethereum" };
  }
  return null;
}

const CURRENCIES = ["USDT", "ETH", "USDC"];
const NETWORKS = ["TRC20", "ERC20", "ETH"];

export default function AdminWalletConfig() {
  const addresses = useQuery(api.platformAddresses.getAll);
  // @ts-ignore
  const upsertAddress = useMutation(api.platformAddresses.upsertAddress);
  // @ts-ignore
  const deleteAddress = useMutation(api.platformAddresses.deleteAddress);
  // @ts-ignore
  const generateUploadUrl = useMutation(api.platformAddresses.generateUploadUrl);

  // Modal state
  const [mode, setMode] = useState<"idle" | "qr" | "manual">("idle");
  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [addressInput, setAddressInput] = useState("");
  const [detectedInfo, setDetectedInfo] = useState<{ network: string; blockchain: string } | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState("");
  const [qrStorageId, setQrStorageId] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── QR Decode from uploaded image ──
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    setErrorMsg("");
    setDetectedInfo(null);

    const url = URL.createObjectURL(file);
    setQrPreview(url);

    // Decode QR from the image
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) { setErrorMsg("Canvas context unavailable."); return; }
      ctx2d.drawImage(img, 0, 0);
      const imageData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        setAddressInput(code.data);
        const detected = detectNetwork(code.data);
        if (detected) {
          setDetectedInfo(detected);
          setNetwork(detected.network);
        } else {
          setErrorMsg("Address decoded but network could not be auto-detected. Please select manually.");
        }
      } else {
        setErrorMsg("Could not decode any QR code from this image. Try a clearer image.");
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setErrorMsg("Failed to load image."); URL.revokeObjectURL(url); };
    img.src = url;
  };

  // ── Manual address input detection ──
  const handleAddressChange = (val: string) => {
    setAddressInput(val);
    setDetectedInfo(null);
    const detected = detectNetwork(val);
    if (detected) {
      setDetectedInfo(detected);
      // Auto-set network for convenience but don't override manual dropdown
    }
  };

  // ── Save ──
  const handleSave = async () => {
    setErrorMsg("");
    if (!addressInput.trim()) { setErrorMsg("Address is required."); return; }

    setSaving(true);
    try {
      let storageId = qrStorageId;
      // Upload QR image if present
      if (qrFile && !storageId) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": qrFile.type }, body: qrFile });
        const json = await res.json();
        storageId = json.storageId;
        setQrStorageId(storageId);
      }

      await upsertAddress({
        currency,
        network,
        address: addressInput.trim(),
        qrStorageId: storageId || undefined,
      });

      setSuccessMsg(`✅ ${currency} / ${network} address saved!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      // Reset form
      setMode("idle");
      setAddressInput("");
      setQrFile(null);
      setQrPreview("");
      setQrStorageId(null);
      setDetectedInfo(null);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (cur: string, net: string) => {
    if (!window.confirm(`Delete ${cur}/${net} address?`)) return;
    try {
      await deleteAddress({ currency: cur, network: net });
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to delete.");
    }
  };

  // ── Build lookup map ──
  const addressMap: Record<string, any> = {};
  addresses?.forEach((a: any) => { addressMap[`${a.currency}-${a.network}`] = a; });

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900 dark:text-white">Platform Wallet Config</h1>
        <div className="w-8" />
      </header>

      <div className="p-5 flex flex-col gap-5">

        {/* Success toast */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex gap-3 items-center animate-slide-in">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{successMsg}</span>
          </div>
        )}

        {/* Current Addresses Table */}
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Current Platform Addresses</h2>
          {addresses === undefined ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#1860F5]" /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {CURRENCIES.map((cur) =>
                NETWORKS.map((net) => {
                  const key = `${cur}-${net}`;
                  const entry = addressMap[key];
                  return (
                    <div key={key} className={`flex items-center gap-3 p-4 rounded-2xl border transition ${
                      entry
                        ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                        : "bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-800 opacity-50"
                    }`}>
                      {/* Crypto badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0 ${
                        cur === "USDT" ? "bg-teal-500" : cur === "ETH" ? "bg-gray-600" : "bg-blue-500"
                      }`}>
                        {cur === "USDT" ? "₮" : cur === "ETH" ? "Ξ" : "$"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-gray-800 dark:text-white">{cur}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{net}</span>
                          {net === "TRC20" && <Wifi size={12} className="text-red-500" />}
                        </div>
                        {entry ? (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">{entry.address}</p>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">Not configured</p>
                        )}
                      </div>
                      {entry && (
                        <button onClick={() => handleDelete(cur, net)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition shrink-0" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Add / Update Section */}
        {mode === "idle" && (
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => { setMode("qr"); setErrorMsg(""); setAddressInput(""); setDetectedInfo(null); setQrPreview(""); setQrFile(null); }}
              className="flex-1 flex flex-col items-center gap-2 p-5 bg-white dark:bg-gray-900 border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500/50 transition"
            >
              <Upload size={28} className="text-[#1860F5]" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Upload QR</span>
              <span className="text-[11px] text-gray-400">Auto-detect network</span>
            </button>
            <button
              onClick={() => { setMode("manual"); setErrorMsg(""); setAddressInput(""); setDetectedInfo(null); }}
              className="flex-1 flex flex-col items-center gap-2 p-5 bg-white dark:bg-gray-900 border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-500/50 transition"
            >
              <Keyboard size={28} className="text-emerald-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Manual Input</span>
              <span className="text-[11px] text-gray-400">Type address + select network</span>
            </button>
          </div>
        )}

        {/* ── QR Upload Mode ── */}
        {mode === "qr" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-white">Upload QR Code</h3>
              <button onClick={() => setMode("idle")} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
            </div>

            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleQrUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500/50 transition bg-blue-50/50 dark:bg-blue-500/5"
            >
              <Upload size={32} className="text-[#1860F5]" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Click to upload QR image</span>
            </button>

            {qrPreview && (
              <div className="flex justify-center">
                <img src={qrPreview} alt="QR Preview" className="w-40 h-40 object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
              </div>
            )}

            {/* Detection result */}
            {detectedInfo && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Network detected: </span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{detectedInfo.blockchain} ({detectedInfo.network})</span>
                </div>
              </div>
            )}

            {addressInput && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Decoded Address</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-mono text-xs text-gray-700 dark:text-gray-300 break-all border border-gray-200 dark:border-gray-700">
                  {addressInput}
                </div>
              </div>
            )}

            {/* Currency + Network selectors */}
            {addressInput && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white outline-none text-sm">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Network</label>
                  <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white outline-none text-sm">
                    {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex gap-2 items-center">
                <AlertTriangle size={16} className="shrink-0" /> {errorMsg}
              </div>
            )}

            {addressInput && (
              <button onClick={handleSave} disabled={saving} className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-3.5 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={18} className="animate-spin" />} Save Address
              </button>
            )}
          </div>
        )}

        {/* ── Manual Input Mode ── */}
        {mode === "manual" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-white">Manual Input</h3>
              <button onClick={() => setMode("idle")} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
            </div>

            {/* Currency + Network */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white outline-none text-sm">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Network</label>
                <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white outline-none text-sm">
                  {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase">Wallet Address</label>
              <input
                type="text"
                placeholder={network === "TRC20" ? "T..." : "0x..."}
                value={addressInput}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#1860F5] transition text-sm font-mono"
              />
            </div>

            {/* Detection hint */}
            {detectedInfo && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Detected: </span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{detectedInfo.blockchain} ({detectedInfo.network})</span>
                </div>
              </div>
            )}

            {addressInput && detectedInfo && detectedInfo.network !== network && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  Address prefix suggests <strong>{detectedInfo.network}</strong> but you selected <strong>{network}</strong>. Make sure this is correct!
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex gap-2 items-center">
                <AlertTriangle size={16} className="shrink-0" /> {errorMsg}
              </div>
            )}

            <button onClick={handleSave} disabled={saving || !addressInput.trim()} className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-3.5 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={18} className="animate-spin" />} Save Address
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </div>
  );
}
