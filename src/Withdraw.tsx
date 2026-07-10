import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Eye, EyeOff, Loader2, FileText } from "lucide-react";
import { BottomSheetModal, BottomSheetOption } from "./components/BottomSheetModal";

const CRYPTO_OPTIONS: BottomSheetOption[] = [
  { value: "USDT", label: "USDT", icon: <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₮</span> },
  { value: "ETH", label: "ETH", icon: <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</span> },
  { value: "USDC", label: "USDC", icon: <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span> },
];

const NETWORK_OPTIONS: BottomSheetOption[] = [
  { value: "TRC20", label: "TRC20" },
  { value: "ERC20", label: "ERC20" },
];

export default function Withdraw() {
  // @ts-ignore
  const wallets = useQuery(api.wallets.getWallets);
  // @ts-ignore
  const hasFundPw = useQuery(api.security.hasFundPassword);
  // @ts-ignore
  const submitWithdrawal = useMutation(api.withdrawals.submitWithdrawal);

  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [walletAddress, setWalletAddress] = useState("");
  const [fundPassword, setFundPassword] = useState("");
  const [showFundPw, setShowFundPw] = useState(false);
  const [quantityStr, setQuantityStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showNetworkSheet, setShowNetworkSheet] = useState(false);

  // Use exchange balance as the source for withdrawal by default
  const available = wallets?.exchangeBalance ?? 0;
  const quantity = parseFloat(quantityStr) || 0;
  const fee = quantity > 0 ? parseFloat((quantity * 0.20).toFixed(8)) : 0;

  const handleSubmit = async () => {
    setError("");
    if (!walletAddress.trim()) { setError("Please enter your wallet address."); return; }
    if (!fundPassword.trim()) { setError("Please enter your fund password."); return; }
    if (quantity <= 0) { setError("Please enter a valid withdrawal amount."); return; }
    if (quantity > available) { setError("Insufficient balance."); return; }

    setSubmitting(true);
    try {
      await submitWithdrawal({
        currency,
        network,
        walletAddress: walletAddress.trim(),
        fundPassword: fundPassword.trim(),
        amount: quantity,
        sourceAccount: "exchange" as const,
      });
      window.location.href = "/withdrawal-records";
    } catch (e: any) {
      setError(e.message || "Withdrawal failed.");
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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">withdraw</h1>
        <a href="/withdrawal-records" className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <FileText size={20} className="text-gray-500 dark:text-gray-400" />
        </a>
      </header>

      <div className="p-5 flex flex-col gap-5">
        {/* Select Currency */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">select currency</label>
          <button onClick={() => setShowCurrencySheet(true)} className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition hover:border-[#229799]">
            <div className="flex items-center gap-3">
              {CRYPTO_OPTIONS.find(c => c.value === currency)?.icon}
              <span className="font-semibold text-gray-800 dark:text-white">{currency}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        </div>

        {/* Withdrawal Network */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">withdrawal network</label>
          <button onClick={() => setShowNetworkSheet(true)} className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition hover:border-[#229799]">
            <span className="font-semibold text-gray-800 dark:text-white">{network}</span>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        </div>

        {/* Withdrawal Address */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">withdrawal address</label>
          <input
            type="text"
            placeholder="please enter or paste your wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#229799] dark:focus:border-[#48CFCB] transition text-sm"
          />
        </div>

        {/* Fund Password */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">fund password</label>
          {hasFundPw === false ? (
            <a href="/security-center" className="block text-center py-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition">
              ⚠ No fund password set — tap to setup in Security Center
            </a>
          ) : (
            <div className="relative">
              <input
                type={showFundPw ? "text" : "password"}
                placeholder="please enter the fund password"
                value={fundPassword}
                onChange={(e) => setFundPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#229799] dark:focus:border-[#48CFCB] transition text-sm pr-12"
              />
              <button type="button" onClick={() => setShowFundPw(!showFundPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                {showFundPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">quantity</label>
            <span className="text-xs text-gray-400 dark:text-gray-500">available: {available}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#229799] dark:focus:border-[#48CFCB] transition text-sm pr-28"
            />
            <button
              type="button"
              onClick={() => setQuantityStr(available.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1860F5] font-bold text-sm hover:text-blue-700 transition"
            >
              maximum
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            handling fee({fee > 0 ? `${fee} ${currency}` : `-- ${currency}`})
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5">
          <h3 className="text-[#1860F5] font-bold text-base mb-3">important notice</h3>
          <div className="text-sm text-[#1860F5]/80 dark:text-blue-300/80 leading-relaxed flex flex-col gap-3">
            <p>After submitting the withdrawal application, the funds are in a frozen state because the withdrawal is in progress and the funds are temporarily under the custody of the system, which does not mean that you have lost the asset or the asset is abnormal.</p>
            <p>To prevent arbitrage, new members who attempt to withdraw funds within 40 days of joining may have their withdrawal requests rejected by the risk control system; please contact the general agent if you have any questions.</p>
            <p>Please first confirm whether your wallet supports the withdrawal currency or network. For example, search for "USDT". If there is no withdrawal function for this currency, it means it is not supported. Please check to avoid losses.</p>
            <p className="font-bold">The handling fee will be 20% of the withdrawal amount, which will be automatically deducted!</p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || hasFundPw === false}
          className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />} next step
        </button>
      </div>

      {/* Bottom Sheet Modals */}
      <BottomSheetModal isOpen={showCurrencySheet} onClose={() => setShowCurrencySheet(false)} options={CRYPTO_OPTIONS} selectedValue={currency} onSelect={setCurrency} />
      <BottomSheetModal isOpen={showNetworkSheet} onClose={() => setShowNetworkSheet(false)} options={NETWORK_OPTIONS} selectedValue={network} onSelect={setNetwork} />
    </div>
  );
}
