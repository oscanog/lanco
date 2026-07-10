import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RechargeRecords() {
  // @ts-ignore
  const records = useQuery(api.recharges.getMyRecharges);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/recharge" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white -ml-8">recharge record</h1>
      </header>

      <div className="p-5 flex flex-col gap-4">
        {records === undefined && (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#1860F5]" /></div>
        )}

        {records && records.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">No recharge records yet.</div>
        )}

        {records && records.map((r: any) => (
          <div key={r._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 shadow-sm">
            <Row label="recharge amount" value={`${r.amount} ${r.currency}`} />
            <Row label="recharge network" value={r.network} />
            <div className="flex justify-between items-start">
              <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium leading-tight" style={{ maxWidth: '35%' }}>recharge address</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 font-medium text-right break-all font-mono max-w-[60%]">{r.walletAddress || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div>
                <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium block">recharge time {new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-md lowercase">
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{value}</span>
    </div>
  );
}
