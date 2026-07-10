import { useState, useRef } from "react";
import { ArrowLeft, Loader2, X, ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// ── Toast System ──
type Toast = { id: number; message: string; type: "success" | "error" };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in cursor-pointer ${
            t.type === "success"
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : "bg-red-500 text-white shadow-red-500/30"
          }`}
        >
          {t.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function AdvancedCertification() {
  const [loading, setLoading] = useState(false);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [holdingFile, setHoldingFile] = useState<File | null>(null);
  const [holdingPreview, setHoldingPreview] = useState<string | null>(null);

  const [missingFront, setMissingFront] = useState(false);
  const [missingHolding, setMissingHolding] = useState(false);

  const frontRef = useRef<HTMLInputElement>(null);
  const holdingRef = useRef<HTMLInputElement>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  const addToast = (message: string, type: "success" | "error") => {
    const id = nextToastId;
    setNextToastId((prev) => prev + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // @ts-ignore
  const generateUploadUrl = useMutation(api.certifications.generateUploadUrl);
  // @ts-ignore
  const submitAdvanced = useMutation(api.certifications.submitAdvanced);

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFrontFile(file);
    setMissingFront(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFrontPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFrontPreview(null);
    }
  };

  const handleHoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setHoldingFile(file);
    setMissingHolding(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setHoldingPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setHoldingPreview(null);
    }
  };

  const clearFront = () => {
    setFrontFile(null);
    setFrontPreview(null);
    if (frontRef.current) frontRef.current.value = "";
  };

  const clearHolding = () => {
    setHoldingFile(null);
    setHoldingPreview(null);
    if (holdingRef.current) holdingRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!frontFile || !holdingFile) {
      if (!frontFile) setMissingFront(true);
      if (!holdingFile) setMissingHolding(true);
      addToast("Please upload both required photos before submitting.", "error");
      return;
    }
    setLoading(true);

    try {
      const postUrl1 = await generateUploadUrl();
      const result1 = await fetch(postUrl1, {
        method: "POST",
        headers: { "Content-Type": frontFile.type },
        body: frontFile,
      });
      const { storageId: idCardFrontStorageId } = await result1.json();

      const postUrl2 = await generateUploadUrl();
      const result2 = await fetch(postUrl2, {
        method: "POST",
        headers: { "Content-Type": holdingFile.type },
        body: holdingFile,
      });
      const { storageId: holdingIdStorageId } = await result2.json();

      await submitAdvanced({ idCardFrontStorageId, holdingIdStorageId });
      addToast("Advanced certification submitted!", "success");
      setTimeout(() => { window.location.href = "/authentication"; }, 1000);
    } catch (err: any) {
      addToast(err.message || "Failed to upload.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#424242] p-5 pb-28">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center mb-8">
        <a href="/authentication" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={24} className="text-[#262626]" />
        </a>
        <h1 className="text-xl font-bold flex-1 text-center pr-8 text-[#262626]">
          advanced certification
        </h1>
      </div>

      <div className="flex flex-col gap-6 max-w-xl mx-auto">

        {/* ── Upload Card 1: ID Card Front ── */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-[#424242]/80 flex justify-between items-center">
            ID Card Front Photo
            {missingFront && <span className="text-red-500 text-xs font-bold">Required</span>}
          </label>

          {frontPreview ? (
            <div className={`relative rounded-2xl overflow-hidden border-2 transition ${missingFront ? "border-red-500" : "border-gray-200"}`}>
              <img src={frontPreview} alt="ID Card Front Preview" className="w-full object-contain max-h-[280px] bg-gray-100" />
              <button
                type="button"
                onClick={clearFront}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition shadow-lg"
                title="Remove and re-upload"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 flex items-center justify-between">
                <span className="text-white text-xs font-medium truncate max-w-[70%]">{frontFile?.name}</span>
                <button
                  type="button"
                  onClick={() => frontRef.current?.click()}
                  className="text-white/80 hover:text-white text-xs font-semibold underline transition"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => frontRef.current?.click()}
              className={`rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition min-h-[180px] ${
                missingFront ? "bg-red-50 border-red-400" : "bg-[#EBF1FF] border-[#3B82F6]/30 hover:border-[#3B82F6]"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${missingFront ? "bg-red-100" : "bg-[#3B82F6]/10"}`}>
                <ImageIcon size={28} className={missingFront ? "text-red-500" : "text-[#3B82F6]"} />
              </div>
              <div className={`text-sm font-semibold ${missingFront ? "text-red-700" : "text-[#262626]"}`}>ID Card Front Photo</div>
              <div className="text-xs text-[#424242]/50 mt-1">Tap to upload a clear photo of your ID</div>
              <div className={`mt-4 text-white text-xs font-semibold px-6 py-2 rounded-full ${missingFront ? "bg-red-500" : "bg-[#2563EB]"}`}>
                Choose File
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={frontRef}
            onChange={handleFrontChange}
          />
        </div>

        {/* ── Upload Card 2: Holding ID ── */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-[#424242]/80 flex justify-between items-center">
            Holding ID Photo
            {missingHolding && <span className="text-red-500 text-xs font-bold">Required</span>}
          </label>

          {holdingPreview ? (
            <div className={`relative rounded-2xl overflow-hidden border-2 transition ${missingHolding ? "border-red-500" : "border-gray-200"}`}>
              <img src={holdingPreview} alt="Holding ID Preview" className="w-full object-contain max-h-[280px] bg-gray-100" />
              <button
                type="button"
                onClick={clearHolding}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition shadow-lg"
                title="Remove and re-upload"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 flex items-center justify-between">
                <span className="text-white text-xs font-medium truncate max-w-[70%]">{holdingFile?.name}</span>
                <button
                  type="button"
                  onClick={() => holdingRef.current?.click()}
                  className="text-white/80 hover:text-white text-xs font-semibold underline transition"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => holdingRef.current?.click()}
              className={`rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition min-h-[180px] ${
                missingHolding ? "bg-red-50 border-red-400" : "bg-[#EBF1FF] border-[#3B82F6]/30 hover:border-[#3B82F6]"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${missingHolding ? "bg-red-100" : "bg-[#3B82F6]/10"}`}>
                <ImageIcon size={28} className={missingHolding ? "text-red-500" : "text-[#3B82F6]"} />
              </div>
              <div className={`text-sm font-semibold ${missingHolding ? "text-red-700" : "text-[#262626]"}`}>Holding ID Photo</div>
              <div className="text-xs text-[#424242]/50 mt-1">Tap to upload a photo of yourself holding your ID</div>
              <div className={`mt-4 text-white text-xs font-semibold px-6 py-2 rounded-full ${missingHolding ? "bg-red-500" : "bg-[#2563EB]"}`}>
                Choose File
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={holdingRef}
            onChange={handleHoldingChange}
          />
        </div>

      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full max-w-xl mx-auto items-center justify-center gap-2 rounded-full bg-[#1D4ED8] py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60 shadow-lg shadow-blue-500/20"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Confirm Submission
        </button>
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
