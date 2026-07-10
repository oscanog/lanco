import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { MessageSquare, User, Globe, Home, Zap, Repeat, Wallet, Users } from "lucide-react";

const quotes = [
  { pair: "BTCUSDT", price: "63223.22", change: -0.03 },
  { pair: "ETHUSDT", price: "1745.2", change: +0.01 },
  { pair: "TRXUSDT", price: "0.33218", change: -0.02 },
  { pair: "XRPUSDT", price: "1.0928", change: -0.05 },
];

export default function Dashboard() {
  // @ts-ignore - Will resolve once convex dev generates backend types
  const me = useQuery(api.users.getMe);
  
  if (me === undefined) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#424242] dark:bg-gray-900 dark:text-gray-100 flex flex-col font-sans mb-16 transition-colors">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#48CFCB] to-[#229799] text-xs font-black text-white">
          L
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-[#229799] dark:text-[#48CFCB]">
            <MessageSquare size={22} />
          </button>
          <a href="/profile" className="text-[#229799] dark:text-[#48CFCB]">
            <User size={22} />
          </a>
          <button className="text-[#229799] dark:text-[#48CFCB]">
            <Globe size={22} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#eff6ff] dark:bg-gray-800 p-6 flex justify-center border-b border-white/80 dark:border-gray-700 transition-colors">
        {/* Placeholder for the vault and bitcoin illustration */}
        <div className="relative w-full max-w-sm h-48 bg-[#93c5fd]/20 rounded-2xl flex items-center justify-center border-2 border-[#229799]/20 overflow-hidden">
          <div className="text-[#229799] text-5xl font-bold flex flex-col items-center">
            <span className="text-4xl px-4 py-2 border-4 border-[#229799] rounded-full mb-2">₿</span>
            <span className="text-sm">Vault & Assets</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1">
        <h2 className="text-2xl font-medium text-center text-[#262626] dark:text-gray-100 mb-6 leading-snug">
          The goal is to become the first choice for customers in commodity futures trading
        </h2>

        {/* Quotes List */}
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <div key={q.pair} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:border dark:border-gray-700 transition-colors">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{q.pair}</span>
              <span className="text-gray-600 dark:text-gray-300 ml-auto mr-12">{q.price}</span>
              <span className={`font-medium w-16 text-right ${q.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {q.change > 0 ? "+" : ""}{q.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-3 transition-colors">
        <NavItem href="/dashboard" icon={Home} label="home" active />
        <NavItem href="#" icon={Zap} label="quotes" />
        <NavItem href="#" icon={Repeat} label="trade" />
        {me?.role === "admin" && (
          <NavItem href="/manage-users" icon={Users} label="manage users" />
        )}
        <NavItem href="/my-assets" icon={Wallet} label="my assets" />
      </nav>
      
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 group">
      <Icon size={24} className={active ? "text-[#229799]" : "text-gray-400 group-hover:text-gray-500"} />
      <span className={`text-[10px] font-semibold ${active ? "text-[#229799]" : "text-gray-400"}`}>{label}</span>
    </a>
  );
}
