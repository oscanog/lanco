import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2, Search, ChevronDown, CheckCircle, AlertCircle, X, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const COUNTRIES = [
  { name: "Afghanistan", prefix: "+93" },
  { name: "Albania", prefix: "+355" },
  { name: "Algeria", prefix: "+213" },
  { name: "Andorra", prefix: "+376" },
  { name: "Angola", prefix: "+244" },
  { name: "Argentina", prefix: "+54" },
  { name: "Australia", prefix: "+61" },
  { name: "Austria", prefix: "+43" },
  { name: "Bahrain", prefix: "+973" },
  { name: "Bangladesh", prefix: "+880" },
  { name: "Belgium", prefix: "+32" },
  { name: "Brazil", prefix: "+55" },
  { name: "Canada", prefix: "+1" },
  { name: "China", prefix: "+86" },
  { name: "Colombia", prefix: "+57" },
  { name: "Denmark", prefix: "+45" },
  { name: "Egypt", prefix: "+20" },
  { name: "Finland", prefix: "+358" },
  { name: "France", prefix: "+33" },
  { name: "Germany", prefix: "+49" },
  { name: "Greece", prefix: "+30" },
  { name: "Hong Kong", prefix: "+852" },
  { name: "India", prefix: "+91" },
  { name: "Indonesia", prefix: "+62" },
  { name: "Ireland", prefix: "+353" },
  { name: "Israel", prefix: "+972" },
  { name: "Italy", prefix: "+39" },
  { name: "Japan", prefix: "+81" },
  { name: "Kenya", prefix: "+254" },
  { name: "Kuwait", prefix: "+965" },
  { name: "Malaysia", prefix: "+60" },
  { name: "Mexico", prefix: "+52" },
  { name: "Morocco", prefix: "+212" },
  { name: "Netherlands", prefix: "+31" },
  { name: "New Zealand", prefix: "+64" },
  { name: "Nigeria", prefix: "+234" },
  { name: "Norway", prefix: "+47" },
  { name: "Oman", prefix: "+968" },
  { name: "Pakistan", prefix: "+92" },
  { name: "Philippines", prefix: "+63" },
  { name: "Poland", prefix: "+48" },
  { name: "Portugal", prefix: "+351" },
  { name: "Qatar", prefix: "+974" },
  { name: "Russia", prefix: "+7" },
  { name: "Saudi Arabia", prefix: "+966" },
  { name: "Singapore", prefix: "+65" },
  { name: "South Africa", prefix: "+27" },
  { name: "South Korea", prefix: "+82" },
  { name: "Spain", prefix: "+34" },
  { name: "Sri Lanka", prefix: "+94" },
  { name: "Sweden", prefix: "+46" },
  { name: "Switzerland", prefix: "+41" },
  { name: "Taiwan", prefix: "+886" },
  { name: "Thailand", prefix: "+66" },
  { name: "Turkey", prefix: "+90" },
  { name: "United Arab Emirates", prefix: "+971" },
  { name: "United Kingdom", prefix: "+44" },
  { name: "United States", prefix: "+1" },
  { name: "Vietnam", prefix: "+84" },
].sort((a, b) => a.name.localeCompare(b.name));

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

export default function JuniorCertification() {
  const [loading, setLoading] = useState(false);

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
  const submitJunior = useMutation(api.certifications.submitJunior);

  const [formData, setFormData] = useState({
    country: "",
    city: "",
    province: "",
    fullName: "",
    phonePrefix: "",
    phoneNumber: "",
    birthday: "",
    idNumber: "",
  });

  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Dropdown states
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);

  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const [prefixSearch, setPrefixSearch] = useState("");
  const prefixRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) setIsCountryOpen(false);
      if (prefixRef.current && !prefixRef.current.contains(event.target as Node)) setIsPrefixOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.prefix.includes(countrySearch)
  );

  const filteredPrefixes = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(prefixSearch.toLowerCase()) || 
    c.prefix.includes(prefixSearch)
  );

  const handleCountrySelect = (countryName: string, prefix: string) => {
    setFormData(prev => ({ ...prev, country: countryName, phonePrefix: prefix }));
    setIsCountryOpen(false);
    setCountrySearch("");
    if (missingFields.includes("country")) setMissingFields(prev => prev.filter(f => f !== "country"));
  };

  const handlePrefixSelect = (prefix: string) => {
    setFormData(prev => ({ ...prev, phonePrefix: prefix }));
    setIsPrefixOpen(false);
    setPrefixSearch("");
    if (missingFields.includes("phonePrefix")) setMissingFields(prev => prev.filter(f => f !== "phonePrefix"));
  };

  const handleChange = (e: any) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (missingFields.includes(e.target.name)) {
      setMissingFields(prev => prev.filter(f => f !== e.target.name));
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const missing: string[] = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) missing.push(key);
    });

    if (missing.length > 0) {
      setMissingFields(missing);
      addToast("Please fill all required fields highlighted in red.", "error");
      return;
    }

    // All good, show summary modal
    setShowSummaryModal(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { phonePrefix, phoneNumber, ...rest } = formData;
      await submitJunior({
        ...rest,
        phoneNumber: `${phonePrefix} ${phoneNumber}`
      });
      addToast("Certification submitted successfully!", "success");
      setTimeout(() => {
        window.location.href = "/authentication";
      }, 1000);
    } catch (err: any) {
      addToast(err.message || "Failed to submit.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isError = (field: string) => missingFields.includes(field);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#424242] p-5 pb-20">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center mb-8">
        <a href="/authentication" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={24} className="text-[#262626]" />
        </a>
        <h1 className="text-xl font-medium text-center flex-1 pr-8 text-[#262626]">
          junior certification
        </h1>
      </div>

      <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4 max-w-xl mx-auto">
        
        {/* Country Label and Custom Dropdown */}
        <div className="flex flex-col relative" ref={countryRef}>
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            Country {isError("country") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <div 
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 cursor-pointer transition ${
              isError("country") ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#3B82F6]"
            } text-[#262626]`}
          >
            <span className={formData.country ? "" : "text-gray-400"}>
              {formData.country || "Select your country"}
            </span>
            <ChevronDown size={20} className={`text-gray-500 transition-transform ${isCountryOpen ? "rotate-180" : ""}`} />
          </div>

          {isCountryOpen && (
            <div className="absolute top-[76px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-slide-down">
              <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <div
                      key={c.name}
                      onClick={() => handleCountrySelect(c.name, c.prefix)}
                      className="px-4 py-3 hover:bg-[#3B82F6]/10 cursor-pointer flex justify-between items-center transition"
                    >
                      <span className="font-medium text-[#262626]">{c.name}</span>
                      <span className="text-gray-400 text-sm">{c.prefix}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400">No countries found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Other Details */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            City {isError("city") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`rounded-xl border bg-white px-4 py-3 outline-none transition ${
              isError("city") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
            }`}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            Province {isError("province") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className={`rounded-xl border bg-white px-4 py-3 outline-none transition ${
              isError("province") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            Full Name {isError("fullName") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`rounded-xl border bg-white px-4 py-3 outline-none transition ${
              isError("fullName") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            Phone Number {(isError("phoneNumber") || isError("phonePrefix")) && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <div className="flex gap-2">
            {/* Phone Prefix Dropdown */}
            <div className="relative" ref={prefixRef}>
               <div 
                 onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                 className={`flex items-center gap-1.5 rounded-xl border px-3 py-3 w-[100px] cursor-pointer transition h-full ${
                  isError("phonePrefix") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 bg-gray-50 text-[#262626] hover:border-[#3B82F6]"
                 }`}
               >
                 <span className="font-semibold text-sm flex-1 text-center">{formData.phonePrefix || "+X"}</span>
                 <ChevronDown size={16} className={`text-gray-500 transition-transform ${isPrefixOpen ? "rotate-180" : ""}`} />
               </div>

               {isPrefixOpen && (
                 <div className="absolute top-[52px] left-0 w-[200px] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={prefixSearch}
                        onChange={(e) => setPrefixSearch(e.target.value)}
                        className="bg-transparent w-full outline-none text-xs"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPrefixes.length > 0 ? (
                        filteredPrefixes.map((c) => (
                          <div
                            key={c.name}
                            onClick={() => handlePrefixSelect(c.prefix)}
                            className="px-3 py-2 hover:bg-[#3B82F6]/10 cursor-pointer flex justify-between items-center transition text-sm"
                          >
                            <span className="text-gray-400 truncate w-[100px]" title={c.name}>{c.name}</span>
                            <span className="font-semibold text-[#262626]">{c.prefix}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-400">No prefixes found</div>
                      )}
                    </div>
                 </div>
               )}
            </div>

            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="555-555-5555"
              className={`flex-1 rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none transition ${
                isError("phoneNumber") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            Birthday {isError("birthday") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={`rounded-xl border bg-white px-4 py-3 outline-none transition ${
              isError("birthday") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold capitalize text-[#424242]/80 flex justify-between">
            ID Number {isError("idNumber") && <span className="text-red-500 text-xs">Required</span>}
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className={`rounded-xl border bg-white px-4 py-3 font-mono text-sm outline-none transition ${
              isError("idNumber") ? "border-red-500 bg-red-50 text-red-900" : "border-gray-200 focus:border-[#3B82F6]"
            }`}
          />
        </div>

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-3.5 font-semibold text-white transition hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/20"
        >
          Proceed to Verification
        </button>
      </form>

      {/* ── Summary & Confirmation Modal ── */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 animate-slide-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
             <button onClick={() => setShowSummaryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-gray-50 hover:bg-gray-100 rounded-full p-1"><X size={20} /></button>
             
             <div className="flex items-center gap-3 mb-4 text-[#3B82F6]">
               <ShieldCheck size={28} />
               <h2 className="text-xl font-bold text-gray-900">Final Verification</h2>
             </div>
             
             <p className="text-gray-600 text-sm mb-6 leading-relaxed">
               Please double-check the details below carefully. They <strong>must match exactly</strong> with the details on your physical Government ID. Mismatches will result in account rejection.
             </p>

             <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-6 space-y-4 overflow-y-auto flex-1">
                <div>
                   <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Full Name</span>
                   <div className="font-semibold text-gray-800">{formData.fullName}</div>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase text-gray-400 block mb-1">ID Number</span>
                   <div className="font-semibold font-mono text-gray-800 tracking-wide bg-white px-2 py-1 rounded inline-block border border-blue-100">{formData.idNumber}</div>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Birthday</span>
                   <div className="font-semibold text-gray-800 bg-white px-2 py-1 rounded inline-block border border-blue-100">{new Date(formData.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className="h-px bg-blue-100/50 my-2"></div>
                <div>
                   <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Location</span>
                   <div className="font-semibold text-gray-800">{formData.city}, {formData.province}, {formData.country}</div>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Phone Number</span>
                   <div className="font-semibold text-gray-800">{formData.phonePrefix} {formData.phoneNumber}</div>
                </div>
             </div>

             <div className="flex flex-col gap-3 mt-auto">
               <button
                 onClick={handleFinalSubmit}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60 shadow-lg shadow-emerald-500/20"
               >
                 {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={20} />}
                 Yes, The Details Match My ID
               </button>
               <button
                 onClick={() => setShowSummaryModal(false)}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 font-semibold text-gray-600 transition hover:bg-gray-200"
               >
                 No, Let Me Edit
               </button>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
