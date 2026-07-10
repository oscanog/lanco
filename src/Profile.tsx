import { useEffect, useState } from "react";
import { ArrowLeft, Moon, Sun, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Profile() {
  const { signOut } = useAuthActions();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 text-[#424242] dark:text-gray-100 p-5 transition-colors">
      <div className="flex items-center mb-8">
        <a href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
          <ArrowLeft size={24} />
        </a>
        <h1 className="text-2xl font-semibold ml-4">Profile Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6 transition-colors">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        >
          <div className="flex items-center gap-3 font-medium">
            {theme === "light" ? <Moon size={20} className="text-gray-500" /> : <Sun size={20} className="text-yellow-400" />}
            Toggle {theme === "light" ? "Dark" : "Light"} Mode
          </div>
        </button>

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-red-500"
        >
          <div className="flex items-center gap-3 font-medium">
            <LogOut size={20} />
            Sign Out
          </div>
        </button>
      </div>
    </div>
  );
}
