import { ArrowLeft, ChevronRight, ShieldCheck, KeyRound, Smartphone } from "lucide-react";

export default function SecurityCenter() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/profile" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-white -ml-8">security center</h1>
      </header>

      <div className="p-5 flex flex-col gap-3 mt-4">
        <MenuRow icon={<Smartphone size={20} />} label="google verification" href="#" disabled />
        <MenuRow icon={<KeyRound size={20} />} label="change password" href="/change-password" />
        <MenuRow icon={<ShieldCheck size={20} />} label="fund password" href="/fund-password" />
      </div>
    </div>
  );
}

function MenuRow({ icon, label, href, disabled }: { icon: React.ReactNode; label: string; href: string; disabled?: boolean }) {
  return (
    <a
      href={disabled ? undefined : href}
      className={`flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 transition group ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#229799] dark:hover:border-[#48CFCB] cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
    </a>
  );
}
