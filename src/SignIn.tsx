import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowLeft, Globe, LayoutGrid, Loader2, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SignIn() {
  const { signIn } = useAuthActions();
  // @ts-ignore
  const makeAdmin = useMutation(api.users.makeAdmin);
  const [tab, setTab] = useState<"mail" | "phone">("mail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProvisionAdmin = async () => {
    try {
      setLoading(true);
      await signIn("password", { email, password, flow: "signUp" });
      await makeAdmin({ email });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || "Failed to provision admin");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { signingIn } = await signIn("password", {
        email,
        password,
        flow: "signIn",
      });
      if (signingIn) {
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setError(
        typeof e === "object" && e?.message
          ? e.message
          : "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5] font-sans text-[#424242] sm:py-12 md:py-20">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-screen w-full max-w-md flex-col bg-white p-6 sm:min-h-0 sm:rounded-3xl sm:border sm:border-white/80 sm:shadow-[0_18px_45px_rgba(66,66,66,0.08)]"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="-ml-2 rounded-full p-2 transition hover:bg-black/5"
            aria-label="Go back"
          >
            <ArrowLeft
              className="text-[#262626]"
              size={24}
              strokeWidth={2.5}
            />
          </a>
          <button
            type="button"
            className="rounded-lg border border-[#424242]/20 p-1.5 text-[#229799] transition hover:border-[#229799]/50"
            aria-label="Language"
          >
            <Globe size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-[#262626]">
          log in
        </h1>

        {/* Tabs */}
        <div className="mb-8 flex overflow-hidden rounded-full border border-[#229799]">
          <button
            type="button"
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              tab === "mail"
                ? "bg-[#229799] text-white"
                : "bg-transparent text-[#424242]"
            }`}
            onClick={() => setTab("mail")}
          >
            mail
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              tab === "phone"
                ? "bg-[#229799] text-white"
                : "bg-transparent text-[#424242]"
            }`}
            onClick={() => setTab("phone")}
          >
            phone
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="flex-1">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[#424242]/70">
              your {tab === "mail" ? "mailbox" : "phone number"}
            </label>
            <input
              type={tab === "mail" ? "email" : "tel"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                tab === "mail" ? "you@example.com" : "+1 234 567 8900"
              }
              className="w-full rounded-2xl border border-[#424242]/20 px-4 py-3.5 text-base text-[#262626] outline-none transition focus:border-[#229799] focus:ring-1 focus:ring-[#229799]"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[#424242]/70">
              your password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#424242]/20 px-4 py-3.5 text-base tracking-widest text-[#262626] outline-none transition focus:border-[#229799] focus:ring-1 focus:ring-[#229799]"
            />
          </div>

          <div className="mb-8 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2 text-sm font-medium text-[#424242]/70"
            >
              <div
                className={`grid size-5 place-items-center rounded-full border transition-colors ${
                  remember
                    ? "border-[#229799] bg-[#229799]"
                    : "border-[#424242]/30"
                }`}
              >
                {remember && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              remember my password
            </button>
          </div>

          {email === "m.viner001@gmail.com" && (
            <button
              type="button"
              onClick={handleProvisionAdmin}
              disabled={loading}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 py-4 font-semibold text-white shadow-[0_10px_22px_rgba(147,51,234,0.25)] transition hover:bg-purple-700 disabled:opacity-60"
            >
              <ShieldCheck size={20} />
              Provision Admin Account
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#229799] py-4 font-semibold text-white shadow-[0_10px_22px_rgba(34,151,153,0.25)] transition hover:bg-[#1d8587] disabled:opacity-60"
          >
            {loading && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {loading ? "signing in..." : "log in"}
          </button>

          <div className="mt-4 text-right">
            <button
              type="button"
              className="text-sm font-medium text-[#229799] hover:underline"
            >
              forget password
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pb-4 text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#229799] hover:underline"
          >
            <LayoutGrid size={18} />
            download app
          </button>
        </div>
      </form>
    </div>
  );
}
