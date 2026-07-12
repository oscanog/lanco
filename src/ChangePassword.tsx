import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function ChangePassword() {
  const changeLoginPw = useAction(api.changePassword.changeLoginPassword);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!oldPassword.trim()) { setError("Please enter your old password."); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }

    setSubmitting(true);
    try {
      await changeLoginPw({ oldPassword, newPassword, confirmPassword });
      setSuccess(true);
      setTimeout(() => { window.location.href = "/security-center"; }, 1500);
    } catch (e: any) {
      setError(e.message || "Failed to update login password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 flex flex-col items-center justify-center gap-4 transition-colors">
        <CheckCircle size={56} className="text-[#1860F5]" />
        <p className="text-lg font-semibold text-gray-800 dark:text-white">Password changed successfully!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting back...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans transition-colors">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/security-center" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="flex-1 text-center text-[15px] font-bold text-gray-900 dark:text-white -ml-8">change password</h1>
      </header>

      <div className="p-5 flex flex-col gap-5 mt-4">
        {/* Old password field */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">old password</label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="enter your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm pr-12"
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">new password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm pr-12"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm new password */}
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="enter your new password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#1860F5] transition text-sm pr-12"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />} confirm submission
        </button>
      </div>
    </div>
  );
}
