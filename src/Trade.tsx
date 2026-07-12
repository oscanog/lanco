import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Zap, Home, Repeat, Users, Wallet, ArrowLeft, X, AlertTriangle, CheckCircle } from "lucide-react";

// ─── Types ───
interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BinanceTick {
  s: string;
  c: string;
  P: string;
  p: string;
}

// ─── Binance helpers ───
const BINANCE_REST = "https://api.binance.com/api/v3";
const BINANCE_WS = "wss://stream.binance.com:9443/ws";

async function fetchKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
  const resp = await fetch(
    `${BINANCE_REST}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  const data = await resp.json();
  return data.map((k: any[]) => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

// ─── Chart canvas renderer ───
function drawCandlestickChart(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  currentPrice: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || candles.length === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const chartH = H * 0.72;
  const volH = H * 0.2;
  const volTop = chartH + H * 0.04;
  const pad = 50;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const prices = candles.flatMap((c) => [c.high, c.low]);
  const pMax = Math.max(...prices) * 1.001;
  const pMin = Math.min(...prices) * 0.999;
  const vMax = Math.max(...candles.map((c) => c.volume)) * 1.1;

  const candleW = Math.max(2, (W - pad) / candles.length - 2);
  const gap = (W - pad) / candles.length;

  const priceToY = (p: number) => ((pMax - p) / (pMax - pMin)) * chartH;
  const volToH = (v: number) => (v / vMax) * volH;

  // Grid lines
  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();

    const priceLabel = (pMax - (pMax - pMin) * (i / 4)).toFixed(2);
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.fillText(priceLabel, W - pad + 4, y + 4);
  }

  // Candles
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const x = i * gap + gap / 2;
    const isGreen = c.close >= c.open;
    const color = isGreen ? "#26a69a" : "#ef5350";

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, priceToY(c.high));
    ctx.lineTo(x, priceToY(c.low));
    ctx.stroke();

    // Body
    const bodyTop = priceToY(Math.max(c.open, c.close));
    const bodyBottom = priceToY(Math.min(c.open, c.close));
    const bodyH = Math.max(1, bodyBottom - bodyTop);
    ctx.fillStyle = color;
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);

    // Volume bars
    ctx.fillStyle = isGreen ? "rgba(38,166,154,0.35)" : "rgba(239,83,80,0.35)";
    const barH = volToH(c.volume);
    ctx.fillRect(x - candleW / 2, volTop + volH - barH, candleW, barH);
  }

  // Current price dashed line
  if (currentPrice >= pMin && currentPrice <= pMax) {
    const priceY = priceToY(currentPrice);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#1860F5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, priceY);
    ctx.lineTo(W - pad, priceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price label box
    ctx.fillStyle = "#1860F5";
    const label = currentPrice.toFixed(2);
    const tw = ctx.measureText(label).width + 8;
    ctx.fillRect(W - pad, priceY - 9, tw, 18);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(label, W - pad + 4, priceY + 4);
  }

  // MA legends at bottom
  ctx.font = "10px sans-serif";
  const ma5 = calcMA(candles, 5);
  const ma10 = calcMA(candles, 10);
  const ma20 = calcMA(candles, 20);
  ctx.fillStyle = "#e6a23c";
  ctx.fillText(`MA5: ${formatK(ma5)}`, 4, volTop + volH + 14);
  ctx.fillStyle = "#409eff";
  ctx.fillText(`MA10: ${formatK(ma10)}`, 100, volTop + volH + 14);
  ctx.fillStyle = "#9b59b6";
  ctx.fillText(`MA20: ${formatK(ma20)}`, 210, volTop + volH + 14);

  const volLabel = `VOLUME: ${formatK(candles[candles.length - 1]?.volume || 0)}`;
  ctx.fillStyle = "#999";
  ctx.fillText(volLabel, 4, volTop - 4);
}

function calcMA(candles: Candle[], period: number): number {
  if (candles.length < period) return 0;
  const slice = candles.slice(-period);
  return slice.reduce((s, c) => s + c.close, 0) / period;
}

function formatK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(3) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(3) + "K";
  return n.toFixed(2);
}

// ─── Interval map for Binance ───
const INTERVAL_MAP: Record<string, string> = {
  "1 min": "1m",
  "5 min": "5m",
  "15 min": "15m",
  "30 min": "30m",
  "1D": "1d",
  "1Week": "1w",
  month: "1M",
};
const TIME_TABS = ["1 min", "5 min", "15 min", "30 min", "1D", "1Week", "month"];

// ─── Main Component ───
export default function Trade() {
  // @ts-ignore
  const me = useQuery(api.users.getMe);
  // @ts-ignore
  const wallets = useQuery(api.wallets.getWallets);

  const [historyDateFrom, setHistoryDateFrom] = useState(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [historyDateTo, setHistoryDateTo] = useState(Date.now());
  const orders = useQuery(api.trade.getMyDeliveryOrders, { dateFrom: historyDateFrom, dateTo: historyDateTo });
  const settleExpired = useMutation(api.trade.settleExpiredOrders);
  const createOrder = useMutation(api.trade.createDeliveryOrder);
  const redeemCode = useMutation(api.copyTrade.redeemCopyTradeCode);
  const confirmCopy = useMutation(api.copyTrade.confirmCopyTrade);
  const settleCopyTrades = useMutation(api.copyTrade.settleCopyTrades);
  const copyHistory = useQuery(api.copyTrade.getMyCopyHistory);

  // Chart state
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState("0.00");
  const [timeTab, setTimeTab] = useState("1 min");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Trade form state
  const [duration, setDuration] = useState(60);
  const [amountStr, setAmountStr] = useState("");
  const [callPct, setCallPct] = useState(50);
  const [putPct, setPutPct] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  // Sub-tab state
  const [mainTab, setMainTab] = useState<"delivery" | "history" | "invited_me" | "invited">("delivery");
  const [invitedMeSub, setInvitedMeSub] = useState<"initiate" | "copying">("initiate");
  const [invitedSub, setInvitedSub] = useState<"initiate" | "release">("initiate");

  // Copy trade state
  const [orderCode, setOrderCode] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    followId: string;
    orderAmount: number;
  } | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = nextToastId;
    setNextToastId((prev) => prev + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [nextToastId]);

  // Countdown
  const [countdown, setCountdown] = useState(0);

  // ── Fetch historical candles ──
  const fetchCandles = useCallback(async () => {
    try {
      const interval = INTERVAL_MAP[timeTab] || "1m";
      const data = await fetchKlines("BTCUSDT", interval, 60);
      setCandles(data);
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    } catch {
      // Binance might be blocked in some regions, silently fail
    }
  }, [timeTab]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // ── WebSocket for live ticker ──
  useEffect(() => {
    const ws = new WebSocket(`${BINANCE_WS}/btcusdt@ticker`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const tick: BinanceTick = JSON.parse(event.data);
        const price = parseFloat(tick.c);
        setCurrentPrice(price);
        setPriceChange(tick.P);

        // Update random sentiment
        const r = Math.random();
        setCallPct(Math.round(45 + r * 10));
        setPutPct(Math.round(100 - (45 + r * 10)));
      } catch { /* ignore */ }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  // ── WebSocket for live candle updates ──
  useEffect(() => {
    const interval = INTERVAL_MAP[timeTab] || "1m";
    const ws = new WebSocket(`${BINANCE_WS}/btcusdt@kline_${interval}`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        if (!k) return;

        const liveCandle: Candle = {
          time: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };

        setCandles((prev) => {
          if (prev.length === 0) return [liveCandle];
          const last = prev[prev.length - 1];
          if (last.time === liveCandle.time) {
            return [...prev.slice(0, -1), liveCandle];
          }
          return [...prev.slice(-59), liveCandle];
        });
      } catch { /* ignore */ }
    };

    return () => ws.close();
  }, [timeTab]);

  // ── Draw chart when candles change ──
  useEffect(() => {
    if (canvasRef.current) {
      drawCandlestickChart(canvasRef.current, candles, currentPrice);
    }
  }, [candles, currentPrice]);

  // ── Countdown timer ──
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const secRemaining = 60 - now.getSeconds();
      setCountdown(secRemaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Settle expired orders periodically ──
  useEffect(() => {
    const timer = setInterval(() => {
      settleExpired().catch(() => {});
      settleCopyTrades().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [settleExpired, settleCopyTrades]);

  const tradeBalance = wallets?.tradeBalance ?? 0;
  const amount = parseFloat(amountStr) || 0;

  const handleOrder = async (direction: "CALL" | "PUT") => {
    if (amount <= 0 || amount > tradeBalance) return;
    setSubmitting(true);
    try {
      const now = new Date();
      const mm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const endMin = now.getMinutes() + Math.ceil(duration / 60);
      const endMm = String(now.getHours()).padStart(2, "0") + ":" + String(endMin % 60).padStart(2, "0");

      await createOrder({
        symbol: "BTC/USDT",
        direction,
        durationSeconds: duration,
        amount,
        openingPrice: currentPrice,
        rateOfReturn: direction === "CALL" ? callPct / 100 : putPct / 100,
        periodStart: mm,
        periodEnd: endMm,
      });
      setAmountStr("");
      addToast("Order placed successfully!", "success");
    } catch (e: any) {
      addToast(e.message || "Order failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeem = async () => {
    if (!orderCode.trim()) return;
    try {
      const currentChartDirection = putPct > callPct ? "PUT" : "CALL";
      const result = await redeemCode({ code: orderCode.trim(), currentChartDirection });
      setConfirmModal({
        followId: result.followId as string,
        orderAmount: result.orderAmount,
      });
    } catch (e: any) {
      const msg = (e.message || "") as string;
      if (msg.includes("already followed")) {
        addToast("You have already followed this order.", "error");
      } else if (msg.includes("Invalid parameter")) {
        addToast("Invalid or expired code. Please check and try again.", "error");
      } else {
        addToast("Something went wrong. Please try again.", "error");
      }
    }
  };

  const handleConfirmCopy = async () => {
    if (!confirmModal) return;
    try {
      await confirmCopy({ followId: confirmModal.followId as any });
      setConfirmModal(null);
      setOrderCode("");
      addToast("Order followed successfully!", "success");
    } catch (e: any) {
      addToast(e.message || "Failed to confirm follow", "error");
    }
  };

  const setPercentage = (pct: number) => {
    setAmountStr((tradeBalance * pct / 100).toFixed(2));
  };

  const pendingOrders = (orders || []).filter((o) => o.status === "pending");
  const completedDelivery = (orders || []).filter((o) => o.status === "completed");
  const completedCopy = (copyHistory || [])
    .filter((c) => {
      const endOfDay = historyDateTo + (24 * 60 * 60 * 1000 - 1);
      return c.status === "settled" && c.createdAt >= historyDateFrom && c.createdAt <= endOfDay;
    })
    .map((c) => ({
      _id: c._id,
      direction: c.direction,
      status: "completed",
      profitAndLoss: c.earnedInterest,
      rateOfReturn: c.interestRateSnapshot,
      amount: c.orderAmount,
      symbol: c.symbol,
      durationSeconds: c.durationSeconds,
      createdAt: c.createdAt,
      settlesAt: c.codeExpiresAt || c.createdAt,
      openingPrice: undefined,
      settlementPrice: undefined,
    }));
  const completedOrders = [...completedDelivery, ...completedCopy].sort((a, b) => b.createdAt - a.createdAt);

  const formatPrice = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-[#424242] dark:text-gray-200 font-sans pb-24">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 md:px-0 mx-auto left-0 md:left-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => setToasts((prev) => prev.filter((to) => to.id !== t.id))}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in cursor-pointer ${
              t.type === "success"
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-red-500 text-white shadow-red-500/30"
            }`}
          >
            {t.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm to follow the order</h3>
              <button onClick={() => setConfirmModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Order amount(<span className="font-semibold text-gray-800 dark:text-white">{confirmModal.orderAmount}</span>)
            </p>
            <button
              onClick={handleConfirmCopy}
              className="w-full text-center text-[#1860F5] font-bold text-lg py-2 hover:text-blue-700 transition"
            >
              sure
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">BTC/USDT</span>
            <span className="text-xs text-gray-400">delivery ▼</span>
          </div>
          <div className="text-right text-xs text-gray-500">
            <span>countdown</span>
            <span className="ml-2 font-mono font-bold text-gray-800 dark:text-white">
              00:00:{String(countdown).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Price display */}
        <div className="px-4 pb-3 flex items-baseline gap-4">
          <span className={`text-3xl font-bold ${parseFloat(priceChange) >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatPrice(currentPrice)}
          </span>
          <span className={`text-sm font-medium ${parseFloat(priceChange) >= 0 ? "text-green-500" : "text-red-500"}`}>
            {parseFloat(priceChange) >= 0 ? "+" : ""}{priceChange}%
          </span>
        </div>

        {/* Time tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {TIME_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTimeTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition ${
                timeTab === t
                  ? "bg-blue-50 text-[#1860F5] dark:bg-blue-500/20"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Live chart */}
      <div className="px-2 py-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{ height: 280 }}
        />
      </div>

      {/* Execution form */}
      <div className="px-4 space-y-3">
        {/* Duration + Period selectors */}
        <div className="flex gap-2">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-medium"
          >
            <option value={60}>60s</option>
            <option value={120}>120s</option>
            <option value={300}>300s</option>
          </select>
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-500 font-medium flex items-center justify-center">
            {(() => {
              const now = new Date();
              const mm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
              const endMin = now.getMinutes() + Math.ceil(duration / 60);
              const endMm = String(now.getHours()).padStart(2, "0") + ":" + String(endMin % 60).padStart(2, "0");
              return `${mm} - ${endMm}`;
            })()}
          </div>
        </div>

        {/* Amount input */}
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800">
          <input
            type="number"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <span className="text-sm font-medium text-gray-400 ml-2">USDT</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>available {tradeBalance.toFixed(2)}</span>
          <span>USDT</span>
        </div>

        {/* Percentage slider */}
        <div className="flex items-center gap-2 border border-blue-200 dark:border-blue-500/30 rounded-xl px-3 py-2">
          {[1, 10, 25, 50, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setPercentage(pct)}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
                Math.round((amount / tradeBalance) * 100) === pct
                  ? "bg-[#1860F5] text-white"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* CALL / PUT */}
        <button
          onClick={() => handleOrder("CALL")}
          disabled={submitting || amount <= 0}
          className="w-full py-4 rounded-xl font-bold text-white text-base bg-[#26a69a] hover:bg-[#1e8e82] disabled:opacity-50 transition"
        >
          CALL {callPct}%
        </button>
        <button
          onClick={() => handleOrder("PUT")}
          disabled={submitting || amount <= 0}
          className="w-full py-4 rounded-xl font-bold text-white text-base bg-[#ef5350] hover:bg-[#d32f2f] disabled:opacity-50 transition"
        >
          PUT {putPct}%
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="mt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex">
          {(
            [
              ["delivery", "delivery order"],
              ["history", "historical orders"],
              ["invited_me", "Invited me"],
              ["invited", "Invited"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className={`flex-1 py-3 text-xs font-medium text-center transition border-b-2 ${
                mainTab === key
                  ? "text-[#1860F5] border-[#1860F5]"
                  : "text-gray-400 border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-4 py-4 min-h-[200px]">
          {/* Delivery orders */}
          {mainTab === "delivery" && (
            <>
              {(() => {
                const latestFollow = (copyHistory || [])[0];
                const now = Date.now();
                const isReflecting = latestFollow && latestFollow.status === "confirmed" && latestFollow.codeExpiresAt && latestFollow.codeExpiresAt > now;
                if (isReflecting) {
                  return <ReflectingCopyCard follow={latestFollow} />;
                }
                return null;
              })()}
              
              {pendingOrders.length === 0 && !((copyHistory || [])[0]?.status === "confirmed" && (copyHistory || [])[0]?.codeExpiresAt! > Date.now()) ? (
                <EmptyState />
              ) : (
                pendingOrders.map((o) => (
                  <OrderCard key={o._id} order={o} />
                ))
              )}
            </>
          )}

          {/* Historical orders */}
          {mainTab === "history" && (
            <>
              <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <input
                    type="date"
                    value={new Date(historyDateFrom - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                    onChange={(e) => setHistoryDateFrom(new Date(e.target.value).getTime())}
                    className="bg-transparent outline-none w-32 cursor-pointer"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={new Date(historyDateTo - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                    onChange={(e) => setHistoryDateTo(new Date(e.target.value).getTime())}
                    className="bg-transparent outline-none w-32 cursor-pointer"
                  />
                </div>
                <span className="text-gray-400 font-bold">&gt;</span>
              </div>
              {completedOrders.length === 0 ? (
                <EmptyState />
              ) : (
                completedOrders.map((o) => (
                  <OrderCard key={o._id} order={o} />
                ))
              )}
            </>
          )}

          {/* Invited me */}
          {mainTab === "invited_me" && (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInvitedMeSub("initiate")}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${
                    invitedMeSub === "initiate"
                      ? "border-[#1860F5] text-[#1860F5] bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 text-gray-400"
                  }`}
                >
                  Initiate follow
                </button>
                <button
                  onClick={() => setInvitedMeSub("copying")}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${
                    invitedMeSub === "copying"
                      ? "border-[#1860F5] text-[#1860F5] bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 text-gray-400"
                  }`}
                >
                  Copying history
                </button>
              </div>

              {invitedMeSub === "initiate" && (
                <>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
                    <input
                      type="text"
                      placeholder="Please enter the order code"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                    <button
                      onClick={handleRedeem}
                      className="bg-[#1860F5] hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full transition"
                    >
                      recognize
                    </button>
                  </div>
                  {(() => {
                    const latestFollow = (copyHistory || [])[0];
                    const now = Date.now();
                    const isReflecting = latestFollow && latestFollow.status === "confirmed" && latestFollow.codeExpiresAt && latestFollow.codeExpiresAt > now;
                    if (isReflecting) {
                      return <ReflectingCopyCard follow={latestFollow} />;
                    }
                    return null;
                  })()}
                  {(copyHistory || []).length === 0 && (
                    <div className="mt-4">
                      <EmptyState />
                    </div>
                  )}
                </>
              )}

              {/* Full Screen Copying History overlay when active */}
              {invitedMeSub === "copying" && (
                <CopyingHistoryScreen 
                   history={copyHistory || []} 
                   onClose={() => setInvitedMeSub("initiate")} 
                />
              )}
            </>
          )}

          {/* Invited */}
          {mainTab === "invited" && (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInvitedSub("initiate")}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${
                    invitedSub === "initiate"
                      ? "border-[#1860F5] text-[#1860F5] bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 text-gray-400"
                  }`}
                >
                  Initiate follow
                </button>
                <button
                  onClick={() => setInvitedSub("release")}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${
                    invitedSub === "release"
                      ? "border-[#1860F5] text-[#1860F5] bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 text-gray-400"
                  }`}
                >
                  Release history
                </button>
              </div>
              <EmptyState />
            </>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 pb-safe z-30">
        <NavItem href="/dashboard" icon={Home} label="home" />
        <NavItem href="#" icon={Zap} label="quotes" />
        <NavItem href="/trade" icon={Repeat} label="Trade" active />
        {me?.role === "admin" && (
          <NavItem href="/manage-users" icon={Users} label="manage users" />
        )}
        <NavItem href="/my-assets" icon={Wallet} label="my assets" />
      </nav>
    </div>
  );
}

// ─── Sub-components ───

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14h12M14 20h8M14 26h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-sm">No data</span>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const isCall = order.direction === "CALL";
  const isCompleted = order.status === "completed";
  const isWin = isCompleted && order.profitAndLoss > 0;

  const formatTime = (ts: number | undefined) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const periodStr = isCompleted 
    ? (order.periodStart && order.periodEnd 
        ? `${order.periodStart} ~ ${order.periodEnd}` 
        : `${formatTime(order.createdAt)} ~ ${formatTime(order.settlesAt || order.createdAt + order.durationSeconds * 1000)}`) 
    : "--";

  let orderTimeStr = "--";
  if (isCompleted && order.createdAt) {
    const d = new Date(order.createdAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    orderTimeStr = `${y}-${m}-${day} ${h}:${min}:${s}`;
  }

  return (
    <div className="mb-4 p-[18px] border border-gray-400 dark:border-gray-600 rounded-[28px] bg-white dark:bg-gray-800 relative z-10">
      {!isCompleted && (
        <div className="text-gray-700 dark:text-gray-300 font-bold mb-2">??? ??? ???</div>
      )}
      
      {/* Header */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className={`text-[15px] tracking-wide font-bold ${
          isCall ? "text-[#4CAF50]" : "text-[#F44336]"
        }`}>
          {order.direction}
        </span>
        <span className="text-[17px] font-bold text-gray-900 dark:text-white">
          {order.symbol?.replace("/", "") || "BTCUSDT"}
        </span>
        <span className="text-[13px] font-semibold text-gray-400 dark:text-gray-400 ml-1">
          {order.durationSeconds}s
        </span>
      </div>

      <div className="flex flex-col space-y-[9px] px-0.5">
        <Row label="time period" value={periodStr} />
        {isCompleted && (
          <Row
            label="profit and loss"
            value={(order.profitAndLoss ?? 0).toFixed(2)}
            isGreen={isWin}
            isRed={!isWin && order.profitAndLoss < 0}
          />
        )}
        <Row
          label="rate of return"
          value={isCompleted ? `${((order.rateOfReturn ?? 0) * 100).toFixed(2)}%` : "--"}
          isGreen={isWin}
          isRed={isCompleted && !isWin}
        />
        <Row label="order quantity" value={order.amount ? (order.amount).toFixed(2) : "--"} />
        {isCompleted && (
          <Row label="the number of transactions" value={order.amount ? (order.amount).toFixed(2) : "--"} />
        )}
        <Row label="opening price" value={isCompleted ? (order.openingPrice ?? 0).toFixed(2) : "--"} />
        <Row label="settlement price" value={isCompleted ? (order.settlementPrice ?? 0).toFixed(2) : "--"} />
        <Row label="order time" value={orderTimeStr} />
      </div>
    </div>
  );
}

function ReflectingCopyCard({ follow }: { follow: any }) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 mt-4">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
        {follow.title || "Lancotech Trading"}
      </div>
      <Row label="Trading pair" value={follow.symbol?.replace("/", "") || "-"} />
      <Row label="Purchase duration" value={follow.durationSeconds ? `${follow.durationSeconds}s` : "-"} />
      <Row label="Release time" value={
        follow.codeCreatedAt ? new Date(follow.codeCreatedAt).toLocaleString("en-US") : "-"
      } />
      <Row label="Order amount" value={follow.orderAmount.toFixed(2)} />
      <Row label="Action" value="" />
    </div>
  );
}

function Row({
  label,
  value,
  isGreen,
  isRed,
}: {
  label: string;
  value: string | number;
  isGreen?: boolean;
  isRed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-300">{label}</span>
      <span
        className={`text-[13px] font-bold ${
          isGreen ? "text-[#4CAF50]" : isRed ? "text-[#F44336]" : "text-gray-400 dark:text-gray-400 font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 group">
      <Icon
        size={24}
        className={
          active
            ? "text-[#1860F5]"
            : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
        }
      />
      <span
        className={`text-[10px] font-semibold transition-colors ${
          active ? "text-[#1860F5]" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {label}
      </span>
    </a>
  );
}

// ─── Copying History Screen Components ───

function CopyingHistoryScreen({ history, onClose }: { history: any[], onClose: () => void }) {
  const settled = history.filter(h => h.status === "settled");
  
  const totalAmount = history.reduce((sum, h) => sum + h.orderAmount, 0);
  const totalProfit = settled.reduce((sum, h) => sum + h.earnedInterest, 0);
  
  const totalFollows = history.length;
  // Winning rate: In this context, everything that settles earns interest. We just say 100.00% or based on real loss.
  const winCount = settled.filter(s => s.earnedInterest > 0).length;
  const winRate = settled.length > 0 ? ((winCount / settled.length) * 100).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 pb-safe overflow-y-auto hidden-scrollbar flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 z-10 sticky top-0 shadow-sm border-b-transparent dark:border-gray-800">
        <button onClick={onClose} className="p-1">
          <ArrowLeft size={24} className="text-black dark:text-white" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1 absolute left-1/2 -translate-x-1/2">Copying history</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <StatBox value={totalAmount.toFixed(2)} label="The total amount of the order(USDT)" />
          <StatBox value={totalFollows.toString()} label="Number of times to follow orders" />
          <StatBox value={totalProfit.toFixed(2)} label="Profit from following orders" />
          <StatBox value={`${winRate}%`} label="winning rate" />
        </div>

        {/* Card List */}
        {history.sort((a,b) => b.createdAt - a.createdAt).map(f => (
          <CopyHistoryCard key={f._id} follow={f} />
        ))}

        {history.length === 0 && (
          <div className="py-12">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 border border-blue-400 dark:border-blue-500 rounded-[22px] text-center bg-white dark:bg-gray-800 shadow-sm min-h-[96px]">
      <span className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{value}</span>
      <span className="text-[11px] font-medium text-gray-400 leading-tight w-[90%] mx-auto">{label}</span>
    </div>
  );
}

function CopyHistoryCard({ follow }: { follow: any }) {
  const formatFullDate = (ts: number | undefined) => {
    if (!ts) return "--";
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  };

  return (
    <div className="mb-4 p-[18px] border border-gray-400 dark:border-gray-600 rounded-[28px] bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex flex-col mb-[12px]">
        <div className="flex justify-between items-start mb-0.5">
          <span className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 shrink-0 mt-0.5 mr-4">Title</span>
          <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200 text-right leading-[1.35]">
            {follow.title}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-[9px] px-0.5">
        <CopyRow label="Trading pair" value={follow.symbol} />
        <CopyRow label="Direction" value={follow.direction} />
        <CopyRow label="Purchase duration" value={`${follow.durationSeconds}s`} />
        
        <CopyRow label="Order time" value={formatFullDate(follow.createdAt)} />
        <CopyRow label="Release time" value={formatFullDate(follow.codeCreatedAt)} />
        <CopyRow label="Order amount" value={follow.orderAmount.toFixed(2)} />
        <CopyRow label="profit and loss" value={follow.earnedInterest.toFixed(2)} />
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-semibold text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}
