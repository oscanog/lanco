import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Copy, Clock, Users, Check } from "lucide-react";

export default function AdminCopyTrade() {
  // @ts-ignore
  const me = useQuery(api.users.getMe);
  const codes = useQuery(api.copyTrade.getMyGeneratedCodes);
  const generateCode = useMutation(api.copyTrade.generateCopyTradeCode);

  const [title, setTitle] = useState("");
  const [symbol] = useState("BTCUSDT");
  const [direction, setDirection] = useState<"CALL" | "PUT">("CALL");
  const [duration, setDuration] = useState(60);
  const [validity, setValidity] = useState(30);
  const [interestRate, setInterestRate] = useState("0.4");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  // Followers for expanded code — always call hook, use "skip" when no code expanded
  const followersQuery = useQuery(
    api.copyTrade.getFollowersByCode,
    expandedCode ? { codeId: expandedCode as any } : "skip"
  );

  const handleGenerate = async () => {
    setSubmitting(true);
    setGeneratedCode("");
    try {
      const code = await generateCode({
        title,
        direction,
        symbol,
        durationSeconds: duration,
        interestRate: (parseFloat(interestRate) || 0.4) / 100,
        validityMinutes: validity,
      });
      setGeneratedCode(code);
    } catch (e: any) {
      alert(e.message || "Failed to generate code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (me === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (me?.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <a href="/manage-users" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Copy Trade Codes</h1>
        <div className="w-8" />
      </header>

      <div className="p-5 space-y-5">
        {/* Generation form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Generate New Code</h2>

          {/* Title */}
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Title</label>
          <input
            type="text"
            placeholder="e.g. Fidelity Capital Investment Group..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:border-[#1860F5]"
          />

          {/* Symbol (read-only) */}
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Symbol</label>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 mb-3 text-sm font-semibold">{symbol}</div>

          {/* Direction */}
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Direction</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setDirection("CALL")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                direction === "CALL"
                  ? "bg-[#26a69a] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400"
              }`}
            >
              CALL
            </button>
            <button
              onClick={() => setDirection("PUT")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                direction === "PUT"
                  ? "bg-[#ef5350] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400"
              }`}
            >
              PUT
            </button>
          </div>

          {/* Duration */}
          <div className="flex gap-4 mb-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Trade Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm"
              >
                <option value={60}>60s</option>
                <option value={120}>120s</option>
                <option value={300}>300s</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Code Validity (mins)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={validity}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v >= 1 && v <= 60) setValidity(v);
                  else if (!e.target.value) setValidity("" as any);
                }}
                onBlur={() => {
                  if (!validity || validity < 1) setValidity(1);
                  else if (validity > 60) setValidity(60);
                }}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1860F5]"
              />
            </div>
          </div>

          {/* Interest rate */}
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#1860F5]"
          />

          <button
            onClick={handleGenerate}
            disabled={submitting}
            className="w-full bg-[#1860F5] hover:bg-blue-600 text-white rounded-xl py-3.5 font-bold text-sm transition disabled:opacity-60"
          >
            {submitting ? "Generating..." : "Generate Code"}
          </button>

          {/* Generated code display */}
          {generatedCode && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-600">Generated Code</span>
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Clock size={12} />
                  <span>Expires in {validity} minutes</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold text-green-700 dark:text-green-400 tracking-widest">
                  {generatedCode}
                </span>
                <button
                  onClick={() => handleCopy(generatedCode)}
                  className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-green-600" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Codes history */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Generated Codes History</h2>

          {(!codes || codes.length === 0) ? (
            <p className="text-sm text-gray-400">No codes generated yet.</p>
          ) : (
            codes.map((c) => (
              <div key={c._id} className="mb-3">
                <button
                  onClick={() => setExpandedCode(expandedCode === c._id ? null : c._id)}
                  className="w-full text-left p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-mono font-bold text-sm tracking-wide">{c.code}</div>
                      {c.title && <div className="text-xs text-gray-500 mt-0.5">{c.title}</div>}
                    </div>
                    <StatusBadge status={c.effectiveStatus} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className={c.direction === "CALL" ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {c.direction}
                    </span>
                    <span>{(c.interestRate * 100).toFixed(2)}%</span>
                    <span>{c.durationSeconds}s</span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {c.followersCount}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                    {c.effectiveStatus === "active" && (
                      <CountdownTimer expiresAt={c.expiresAt} />
                    )}
                  </div>
                </button>

                {/* Expanded followers */}
                {expandedCode === c._id && followersQuery && (
                  <div className="ml-4 mt-2 space-y-2">
                    {followersQuery.length === 0 ? (
                      <p className="text-xs text-gray-400 pl-4">No followers yet.</p>
                    ) : (
                      followersQuery.map((f) => (
                        <div key={f._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium">{f.userName}</span>
                            <span className="text-green-500 font-bold">+{f.earnedInterest.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 mt-1">
                            <span>{f.userEmail}</span>
                            <span>Asset: {f.totalAssetSnapshot.toFixed(2)}</span>
                          </div>
                          <div className="text-gray-300 mt-1">{new Date(f.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-600 dark:bg-green-500/10",
    expired: "bg-gray-100 text-gray-400 dark:bg-gray-700",
    consumed: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
}

function CountdownTimer({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setRemaining("expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}m ${secs}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return <span className="ml-2 text-amber-500 font-medium">({remaining})</span>;
}
