import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Copy, Sun, Moon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Profile() {
  const { signOut } = useAuthActions();
  // @ts-ignore
  const user = useQuery(api.users.getMe);
  const [simulated, setSimulated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dark mode state — read from <html> class on mount
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const copyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    { label: "simulated trading", type: "toggle", state: simulated, setState: setSimulated },
    { label: "security center" },
    { label: "authentication", onClick: () => window.location.href = "/authentication" },
    { label: "language" },
    { label: "invite friends" },
    { label: "online service" },
    { label: "platform introduction" },
    { label: "help center" },
    { label: "download" },
    { label: "version number", text: "2.9.6" },
    { label: "clear cache" },
  ];

  if (user === undefined) {
    return <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 flex items-center justify-center text-[#424242] dark:text-gray-300">Loading...</div>;
  }

  const email = user?.email || "user@example.com";
  const avatarLetter = email.charAt(0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 font-sans text-[#424242] dark:text-gray-200 pb-6 transition-colors">
      
      {/* Header */}
      <div className="flex items-center px-4 py-4 mb-6">
        <a href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={24} className="text-[#262626] dark:text-gray-300" />
        </a>
        <h1 className="text-xl font-medium text-center flex-1 pr-8 text-[#262626] dark:text-white">
          personal center
        </h1>
      </div>

      <div className="px-5">
        {/* User Card */}
        <div className="relative rounded-[20px] border-4 border-[#2563EB] dark:border-[#3B82F6] bg-[#E8EAEB] dark:bg-gray-800 px-5 py-6 mb-8 mt-6">
          {/* Avatar Ring overlapping top */}
          <div className="absolute -top-10 left-5">
            <div className="flex size-[72px] items-center justify-center rounded-full border-[3px] border-[#2563EB] dark:border-[#3B82F6] bg-[#E8EAEB] dark:bg-gray-800">
              <span className="text-4xl font-light text-[#262626] dark:text-white -mt-1">{avatarLetter}</span>
            </div>
          </div>
          
          {/* VIP Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-sm bg-[#FCE38A] px-2 py-0.5 shadow-sm">
            <div className="bg-black text-[#FCE38A] text-[10px] font-black px-1 leading-none rounded-sm">V</div>
            <span className="text-[10px] font-bold text-black opacity-80">VIP2</span>
          </div>

          <div className="mt-8 flex flex-col items-start gap-1">
            <span className="text-[17px] font-medium text-[#262626] dark:text-white">{email}</span>
            <div className="flex items-center gap-1.5 text-[13px] text-[#424242]/80 dark:text-gray-400">
              ID:{user?._id ? (user._id.substring(0, 12).toUpperCase() + "...") : "NOT_FOUND"} 
              <button onClick={copyId} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition relative">
                <Copy size={16} strokeWidth={1.5} />
                {copied && <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">Copied</span>}
              </button>
            </div>
            <div className="mt-2 rounded-full bg-[#3B82F6] px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              advanced certification
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item, idx) => (
            <div 
              key={idx}
              onClick={item.onClick}
              className={`flex items-center justify-between rounded-xl border border-[#93C5FD]/50 dark:border-gray-700 bg-[#F5F7F8] dark:bg-gray-900 px-4 py-4 transition ${item.onClick ? 'cursor-pointer hover:bg-[#E5E7EB] dark:hover:bg-gray-800' : ''}`}
            >
              <span className="text-[15px] font-medium text-[#424242] dark:text-gray-200">
                {item.label}
              </span>
              
              <div className="flex items-center gap-3">
                {item.text && (
                  <span className="text-[15px] text-[#424242]/70 dark:text-gray-400">{item.text}</span>
                )}
                
                {item.type === "toggle" ? (
                  <button 
                    type="button"
                    onClick={() => item.setState && item.setState(!item.state)}
                    className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.state ? 'bg-[#3B82F6]' : 'bg-[#D1D5DB] dark:bg-gray-600'
                      }`}
                  >
                    <span 
                      className={`pointer-events-none inline-block size-[24px] rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.state ? 'translate-x-[22px]' : 'translate-x-0'
                        }`} 
                    />
                  </button>
                ) : (
                  <ChevronRight size={20} className="text-[#424242]/40 dark:text-gray-500" />
                )}
              </div>
            </div>
          ))}

          {/* ── Dark / Light Mode Toggle ── */}
          <div className="flex items-center justify-between rounded-xl border border-[#93C5FD]/50 dark:border-gray-700 bg-[#F5F7F8] dark:bg-gray-900 px-4 py-4 transition">
            <div className="flex items-center gap-2.5">
              {isDark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
              <span className="text-[15px] font-medium text-[#424242] dark:text-gray-200">
                {isDark ? "dark mode" : "light mode"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDark ? 'bg-indigo-500' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-[24px] rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDark ? 'translate-x-[22px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* ── Log Out ── */}
          <div
            onClick={handleSignOut}
            className="flex items-center justify-between rounded-xl border border-[#93C5FD]/50 dark:border-gray-700 bg-[#F5F7F8] dark:bg-gray-900 px-4 py-4 cursor-pointer hover:bg-[#E5E7EB] dark:hover:bg-gray-800 transition"
          >
            <span className="text-[15px] font-medium text-[#424242] dark:text-gray-200">log out</span>
            <ChevronRight size={20} className="text-[#424242]/40 dark:text-gray-500" />
          </div>
        </div>
      </div>

    </div>
  );
}
