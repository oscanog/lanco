import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, ArrowUpDown, Loader2 } from "lucide-react";
import { BottomSheetModal, BottomSheetOption } from "./components/BottomSheetModal";

const CRYPTO_OPTIONS: BottomSheetOption[] = [
  { value: "USDT", label: "USDT", icon: <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₮</span> },
  { value: "ETH", label: "ETH", icon: <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</span> },
  { value: "USDC", label: "USDC", icon: <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span> },
];

type AccountType = "exchange" | "trade";

export default function Transfer() {
  // @ts-ignore
  const wallets = useQuery(api.wallets.getWallets);
  // @ts-ignore
  const transferFunds = useMutation(api.wallets.transferFunds);

  const [currency, setCurrency] = useState("USDT");
  const [directionExchangeToTrade, setDirectionExchangeToTrade] = useState(true);
  const [quantityStr, setQuantityStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);

  const fromAccount: AccountType = directionExchangeToTrade ? "exchange" : "trade";
  const toAccount: AccountType = directionExchangeToTrade ? "trade" : "exchange";
  const fromLabel = directionExchangeToTrade ? "Exchange" : "Trade";
  const toLabel = directionExchangeToTrade ? "Trade" : "Exchange";

  const fromBalance = wallets ? wallets[`${fromAccount}Balance` as keyof typeof wallets] as number : 0;
  const quantity = parseFloat(quantityStr) || 0;

  const handleSwap = () => {
    setDirectionExchangeToTrade(!directionExchangeToTrade);
    setQuantityStr("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (quantity <= 0) { setError("Please enter a valid amount."); return; }
    if (quantity > fromBalance) { setError(`Insufficient ${fromLabel} balance.`); return; }

    setSubmitting(true);
    try {
      await transferFunds({ fromAccount, toAccount, amount: quantity, currency });
      setSuccess(`Successfully transferred ${quantity} ${currency} from ${fromLabel} to ${toLabel}!`);
      setQuantityStr("");
    } catch (e: any) {
      setError(e.message || "Transfer failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/my-assets" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">fund transfer</h1>
        <div className="w-8" /> {/* Spacer to center title */}
      </header>

      <div className="p-5 flex flex-col gap-5">
        {/* Select Currency */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">select currency</label>
          <button onClick={() => setShowCurrencySheet(true)} className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl transition hover:border-[#1860F5]">
            <div className="flex items-center gap-3">
              {CRYPTO_OPTIONS.find(c => c.value === currency)?.icon}
              <span className="font-semibold text-gray-800 dark:text-white">{currency}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        </div>

        {/* Wallet Swap Box */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">wallet</label>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 relative">
            {/* From Node */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">▽</span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white block">{fromLabel}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">available : {fromBalance.toFixed(8)} {currency}</span>
                </div>
              </div>
              <span className="text-gray-300 dark:text-gray-600">›</span>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwap}
                className="w-12 h-12 bg-[#1860F5] hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <ArrowUpDown size={22} />
              </button>
            </div>

            {/* To Node */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs">●</span>
                <span className="font-semibold text-gray-800 dark:text-white">{toLabel}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">›</span>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">quantity</label>
          <div className="relative">
            <input
              type="number"
              placeholder="please enter quantity"
              value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] dark:focus:border-blue-500 transition text-sm pr-36"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{currency}</span>
              <button
                type="button"
                onClick={() => setQuantityStr(fromBalance.toString())}
                className="text-[#1860F5] font-bold text-sm hover:text-blue-700 transition"
              >
                maximum
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium">{success}</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1860F5]/70 hover:bg-[#1860F5] text-white rounded-xl py-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />} exchange
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheetModal isOpen={showCurrencySheet} onClose={() => setShowCurrencySheet(false)} options={CRYPTO_OPTIONS} selectedValue={currency} onSelect={setCurrency} />
    </div>
  );
}
