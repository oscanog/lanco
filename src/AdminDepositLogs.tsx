import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminDepositLogs() {
  const records = useQuery(api.recharges.getAllSponsoredLogs);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/profile" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="flex-1 text-center text-[15px] font-bold text-gray-900 dark:text-white -ml-8">Admin Deposit Logs</h1>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {records === undefined && (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#1860F5]" /></div>
        )}

        {records && records.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">No deposits sponsored yet.</div>
        )}

        {records && records.map((r: any) => (
          <div key={r._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Target</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.targetUser.name}</p>
                <p className="text-xs text-gray-500">{r.targetUser.email}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-emerald-500">+{r.amount} {r.currency}</p>
                <p className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">{r.network}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Sponsor Auth</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.sponsorAdmin.name}</p>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
