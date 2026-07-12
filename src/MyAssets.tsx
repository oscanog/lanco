import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Eye, RefreshCw, Wallet, Scan, Zap, Home, Repeat, Users, CircleDollarSign, X, Search, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function MyAssets() {
  const settings = useQuery(api.settings.getSettings);
  // @ts-ignore
  const me = useQuery(api.users.getMe);
  // @ts-ignore
  const wallets = useQuery(api.wallets.getWallets);
  const todaysEarnings = useQuery(api.copyTrade.getTodaysEarnings);
  
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

  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState("PHP");
  const [searchQuery, setSearchQuery] = useState("");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    if (modalOpen && Object.keys(rates).length === 0) {
      setRatesLoading(true);
      fetch(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.rates) setRates(data.rates);
        })
        .finally(() => setRatesLoading(false));
    }
  }, [modalOpen, currencyCode, rates]);

  const filteredCurrencies = useMemo(() => {
    return Object.keys(rates).filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rates, searchQuery]);

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
            
            <div className="text-sm text-white/90 flex gap-1 items-center relative z-10">
              today's earnings: 
              <button 
                onClick={() => setModalOpen(true)}
                className="font-medium text-[#4ADE80] hover:underline cursor-pointer"
              >
                ≈{SettingsLoaded(settings) && todaysEarnings ? `${formatValue(todaysEarnings.earnings)} (${todaysEarnings.percentage.toFixed(2)}%)` : "$0.00"}
              </button>
            </div>
          </div>

          {/* Bottom Half: Pale Blue */}
          <div className="bg-[#E4EFFF] dark:bg-gray-800 px-2 py-6 flex justify-around">
            <ActionIcon icon={<CircleDollarSign size={24} />} label="withdraw" href="/withdraw" />
            <ActionIcon icon={<Wallet size={24} />} label="recharge" href="/recharge" />
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
        <NavItem href="/trade" icon={Repeat} label="trade" />
        {me?.role === "admin" && (
          <NavItem href="/manage-users" icon={Users} label="manage users" />
        )}
        <NavItem href="/my-assets" icon={Wallet} label="my assets" active />
      </nav>
      {/* Currency Conversion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); setDropdownOpen(false); }}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-visible" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Realtime Conversion</h3>
              <button onClick={() => { setModalOpen(false); setDropdownOpen(false); }} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 pb-6 space-y-5">
              
              {/* Dropdown Toggle */}
              <div className="relative">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Select Target Currency</label>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between transition focus:border-[#1860F5] outline-none text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{targetCurrency}</span>
                  <Zap size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown List */}
                {dropdownOpen && (
                  <div className="absolute top-[110%] left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-10 max-h-[250px] flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm pl-8 pr-2 py-1.5 outline-none font-medium dark:text-white"
                      />
                    </div>
                    <div className="overflow-y-auto p-1 flex-1">
                      {filteredCurrencies.map(c => (
                        <button
                          key={c}
                          onClick={() => { setTargetCurrency(c); setDropdownOpen(false); setSearchQuery(""); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                            targetCurrency === c 
                              ? "bg-[#1860F5]/10 text-[#1860F5] font-bold" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                      {filteredCurrencies.length === 0 && !ratesLoading && (
                        <div className="text-center text-xs text-gray-400 py-3">No currencies found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Two Column Display */}
              <div className="flex bg-blue-50 dark:bg-blue-500/10 rounded-2xl overflow-hidden shadow-inner">
                
                {/* Original */}
                <div className="flex-1 p-4 border-r border-[#1860F5]/10 text-center flex flex-col justify-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Original</div>
                  <div className="text-[10px] font-bold text-gray-400 mb-1">{currencyCode}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white break-all">
                    {todaysEarnings ? formatValue(todaysEarnings.earnings) : "$0.00"}
                  </div>
                </div>

                {/* Arrow Icon center */}
                <div className="w-10 bg-white/50 dark:bg-gray-900/50 flex flex-col justify-center items-center backdrop-blur-sm border-x border-[#1860F5]/10 relative">
                  <ArrowRight size={18} className="text-[#1860F5]" />
                </div>

                {/* Converted */}
                <div className="flex-1 p-4 text-center flex flex-col justify-center bg-[#1860F5]/5 dark:bg-[#1860F5]/20">
                   <div className="text-xs text-[#1860F5] uppercase tracking-wider mb-0.5 font-bold">Converted</div>
                   <div className="text-[10px] font-bold text-[#1860F5]/70 mb-1">{targetCurrency}</div>
                   <div className="text-lg font-bold text-[#1860F5] break-all">
                    {ratesLoading ? (
                      <Loader2 size={20} className="animate-spin mx-auto opacity-50" />
                    ) : rates[targetCurrency] && todaysEarnings ? (
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: targetCurrency }).format(todaysEarnings.earnings * rates[targetCurrency])
                    ) : (
                      "..."
                    )}
                   </div>
                </div>

              </div>

              {/* Rate hint */}
              <div className="text-center text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-2">
                1 {currencyCode} = {rates[targetCurrency] ? rates[targetCurrency].toFixed(4) : "..."} {targetCurrency}
              </div>

            </div>
          </div>
        </div>
      )}
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
