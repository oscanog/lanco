import { ArrowLeft, Search, FileText } from "lucide-react";
import { useState } from "react";

const RECHARGE_COINS = [
  { value: "USDT", label: "USDT", icon: <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₮</span> },
  { value: "ETH", label: "ETH", icon: <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</span> },
  { value: "USDC", label: "USDC", icon: <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">$</span> },
];

export default function Recharge() {
  const [search, setSearch] = useState("");

  const filteredCoins = RECHARGE_COINS.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/my-assets" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">recharge</h1>
        <a href="/recharge-records" className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <FileText size={20} className="text-gray-500 dark:text-gray-400" />
        </a>
      </header>

      <div className="p-5 flex flex-col gap-5">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#1860F5] focus:bg-white dark:focus:bg-gray-900 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-800 dark:text-gray-200 outline-none transition"
          />
        </div>

        {/* List of Coins */}
        <div className="flex flex-col gap-3">
          {filteredCoins.map((coin) => (
            <a
              key={coin.value}
              href={`/recharge/${coin.value}`}
              className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                {coin.icon}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{coin.label}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">›</span>
            </a>
          ))}
          {filteredCoins.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No matching cryptocurrency found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
