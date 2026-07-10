import { ArrowRight, Eye, RefreshCw, Wallet, Scan, Zap, Home, Repeat, Users, CircleDollarSign } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function MyAssets() {
  const settings = useQuery(api.settings.getSettings);
  // @ts-ignore
  const me = useQuery(api.users.getMe);
  // @ts-ignore
  const wallets = useQuery(api.wallets.getWallets);
  
  const currencyCode = settings?.displayCurrency || "USD";

  // Formatter for dynamic currency
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(val);
  };

  const exchangeBal = wallets?.exchangeBalance ?? 0;
  const tradeBal = wallets?.tradeBalance ?? 0;
  const perpetualBal = wallets?.perpetualBalance ?? 0;
  const totalBalance = exchangeBal + tradeBal + perpetualBal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A5C8FE] to-[#F5F7F8] dark:from-[#1E3A8A] dark:to-gray-950 text-[#424242] dark:text-gray-200 font-sans pb-24 transition-colors">
      
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold text-white">my assets</h1>
      </header>

      {/* Main Asset Valuation Card */}
      <div className="px-5">
        <div className="rounded-[24px] overflow-hidden shadow-sm flex flex-col">
          {/* Top Half: Blue */}
          <div className="bg-[#1860F5] px-6 py-6 text-white pb-8 relative">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-white/90 text-[15px]">
                asset valuation <Eye size={18} />
              </div>
              <span className="font-medium text-sm">{currencyCode}</span>
            </div>
            
            <div className="text-[40px] font-bold tracking-tight mb-2 leading-none">
              {SettingsLoaded(settings) ? formatValue(totalBalance) : "..."}
            </div>
            
            <div className="text-sm text-white/90 flex gap-1 items-center">
              today's earnings: <span className="font-medium">≈{SettingsLoaded(settings) ? formatValue(0) : "$0.00"} (0.00%)</span>
            </div>
          </div>

          {/* Bottom Half: Pale Blue */}
          <div className="bg-[#E4EFFF] dark:bg-gray-800 px-2 py-6 flex justify-around">
            <ActionIcon icon={<CircleDollarSign size={24} />} label="withdraw" href="/withdraw" />
            <ActionIcon icon={<Wallet size={24} />} label="recharge" />
            <ActionIcon icon={<RefreshCw size={24} />} label="transfer" href="/transfer" />
            <ActionIcon icon={<Scan size={24} />} label="exchange" />
          </div>
        </div>
      </div>

      {/* My Account List */}
      <div className="px-5 mt-8">
        <h2 className="text-[22px] font-medium text-black dark:text-white mb-0.5">my account</h2>
        <p className="text-sm text-[#424242] dark:text-gray-400 mb-5">Trading volume: 0</p>

        <div className="flex flex-col gap-4">
          <AccountCard title="Exchange" balance={exchangeBal} currencyCode={currencyCode} settingsLoaded={SettingsLoaded(settings)} />
          <AccountCard title="Trade" balance={tradeBal} currencyCode={currencyCode} settingsLoaded={SettingsLoaded(settings)} />
          <AccountCard title="Perpetual" balance={perpetualBal} currencyCode={currencyCode} settingsLoaded={SettingsLoaded(settings)} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 transition-colors pb-safe">
        <NavItem href="/dashboard" icon={Home} label="home" />
        <NavItem href="#" icon={Zap} label="quotes" />
        <NavItem href="#" icon={Repeat} label="trade" />
        {me?.role === "admin" && (
          <NavItem href="/manage-users" icon={Users} label="manage users" />
        )}
        <NavItem href="/my-assets" icon={Wallet} label="my assets" active />
      </nav>
    </div>
  );
}

function SettingsLoaded(settings: any) {
  return settings !== undefined;
}

function ActionIcon({ icon, label, href }: { icon: any; label: string; href?: string }) {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else {
      alert("Coming soon");
    }
  };

  return (
    <div onClick={handleClick} className="flex flex-col items-center gap-2 cursor-pointer transition active:scale-95">
      <div className="w-[50px] h-[50px] rounded-full bg-[#1860F5] text-white flex items-center justify-center shadow-sm hover:shadow-md transition">
        {icon}
      </div>
      <span className="text-xs font-medium text-[#424242] dark:text-gray-200">{label}</span>
    </div>
  );
}

function AccountCard({ title, balance, currencyCode, settingsLoaded }: { title: string; balance: number; currencyCode: string; settingsLoaded: boolean }) {
  const val = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(balance);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[16px] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] dark:shadow-none border border-black/5 dark:border-gray-700 relative overflow-hidden transition-colors cursor-pointer group hover:border-[#1860F5]/50">
      <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r bg-[#1860F5]" />
      <div className="flex justify-between items-center mb-8 pl-3">
        <span className="text-[17px] font-medium text-black dark:text-white">{title}</span>
        <ArrowRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="pl-3">
        <span className="block text-xs font-medium text-gray-400 mb-1">available balance</span>
        <span className="block text-lg font-medium text-[#1860F5] dark:text-[#60A5FA]">
          {settingsLoaded ? val : "..."}
        </span>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 group">
      <Icon size={24} className={active ? "text-[#1860F5]" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors"} />
      <span className={`text-[10px] font-semibold transition-colors ${active ? "text-[#1860F5]" : "text-gray-400 dark:text-gray-500"}`}>{label}</span>
    </a>
  );
}
