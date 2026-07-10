import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PickerModal } from "./components/PickerModal";

export default function RechargeDetails() {
  const currency = window.location.pathname.split("/").pop()?.toUpperCase() || "USDT";

  const [network, setNetwork] = useState(currency === "ETH" ? "ETH" : "TRC20");
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hook into the user's unique addresses
  const me = useQuery(api.users.getMe);
  const ensureAddresses = useMutation(api.users.generateDepositAddresses);

  useEffect(() => {
    if (me && !me.depositAddresses) {
      ensureAddresses().catch(console.error);
    }
  }, [me, ensureAddresses]);

  // Resolve user's unique address for selected network
  const userAddresses = me?.depositAddresses as any;
  const DEPOSIT_ADDRESS = userAddresses ? userAddresses[network === "ETH" ? "ERC20" : network] : "Generating...";

  const NETWORKS = [
    { value: "TRC20", label: "TRC20" },
    { value: "ERC20", label: "ERC20" },
    { value: "ETH", label: "ETH" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    if (currency === "ETH") return <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</span>;
    if (currency === "USDC") return <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span>;
    return <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₮</span>;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/recharge" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white -ml-8">recharge {currency}</h1>
      </header>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Currency Row */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">recharge currency</label>
          <a href="/recharge" className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              {getIcon()}
              <span className="font-semibold text-gray-800 dark:text-white">{currency}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </a>
        </div>

        {/* Network Row */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">recharge network</label>
          <button 
            onClick={() => setShowNetworkPicker(true)}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"
          >
            <span className="font-semibold text-gray-800 dark:text-white">{network}</span>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        </div>

        {/* QR Code Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-5 mt-2">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">save qr code</h2>
          
          <div className="border border-[#1860F5] rounded-2xl p-4 bg-white">
            <QRCodeSVG value={DEPOSIT_ADDRESS} size={180} />
          </div>

          <div className="flex items-center gap-2 mt-2 break-all">
            <span className="text-xs text-gray-500 font-mono tracking-wide">{DEPOSIT_ADDRESS}</span>
            <button 
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition shrink-0"
              title="Copy Address"
            >
              {copied ? <span className="text-xs text-emerald-500 font-bold">Copied!</span> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Guidelines Box */}
        <div className="bg-[#EAF1FF] dark:bg-blue-900/20 text-[#2B6AF5] dark:text-blue-300 text-[13px] leading-relaxed rounded-3xl p-5 flex flex-col gap-4">
          <p>Please select the above-mentioned token system and currency type and transfer the corresponding amount for deposit. Please do not transfer any other irrelevant assets, otherwise they will not be retrieved.</p>
          <p>After you recharge the above address, you need to confirm the entire network node before it can be credited;</p>
          <p>Please make sure that your computer and browser are safe to prevent information from being tampered with or leaked;</p>
          <p>The above deposit address is the official payment address of the platform, please look for the official deposit address of the platform, and the loss of funds caused by incorrect charging shall be borne by yourself;</p>
        </div>

      </div>

      <PickerModal 
        isOpen={showNetworkPicker} 
        onClose={() => setShowNetworkPicker(false)} 
        onConfirm={setNetwork}
        options={NETWORKS} 
        selectedValue={network} 
      />
    </div>
  );
}
