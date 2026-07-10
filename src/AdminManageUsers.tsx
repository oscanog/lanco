import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ArrowLeft, UserPlus, Eye, X, KeySquare, Wand2, CheckCircle, AlertCircle, Copy, Check, Loader2, UserCheck, UploadCloud, Search, SlidersHorizontal, ArrowUpDown, Clock, ShieldCheck, ShieldX } from "lucide-react";

// ── Status Badge ──
function StatusBadge({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
        <ShieldCheck size={13} /> Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
        <Clock size={13} /> Pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
        <ShieldX size={13} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">
      Unverified
    </span>
  );
}

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

// ── Helpers ──
function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const nums = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + nums + symbols;
  let pw = "";
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += nums[Math.floor(Math.random() * nums.length)];
  pw += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 4; i < 16; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw.split("").sort(() => Math.random() - 0.5).join("");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Component ──
export default function AdminManageUsers() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  const [createModal, setCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [creating, setCreating] = useState(false);

  const [resetModal, setResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [copiedPw, setCopiedPw] = useState(false);

  // New states for the post-creation credential copy modal
  const [successGenerated, setSuccessGenerated] = useState<{ email: string; pw: string } | null>(null);
  const [hasCopiedGenerated, setHasCopiedGenerated] = useState(false);

  // Meal Allowance
  const mealInputRef = useRef<HTMLInputElement>(null);
  const [mealUploading, setMealUploading] = useState(false);

  // Search, filter, sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // @ts-ignore
  const approveCert = useMutation(api.certifications.approveCertification);
  // @ts-ignore
  const rejectCert = useMutation(api.certifications.rejectCertification);
  // @ts-ignore
  const submitMealAllowance = useMutation(api.certifications.submitMealAllowance);
  // @ts-ignore
  const generateUploadUrl = useMutation(api.certifications.generateUploadUrl);

  // @ts-ignore
  const adminCreateUser = useAction(api.admin.adminCreateUser);
  // @ts-ignore
  const adminResetPassword = useAction(api.admin.adminResetPassword);

  const users = useQuery(api.users.listUsers);
  // @ts-ignore
  const selectedUser = useQuery(api.users.getUser, selectedUserId ? { targetUserId: selectedUserId } : "skip");

  // ── Toast helpers ──
  const addToast = (message: string, type: "success" | "error") => {
    const id = nextToastId;
    setNextToastId((prev) => prev + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Handlers ──
  const handleApprove = async (userId: Id<"users">, type: "junior" | "advanced" | "mealAllowance") => {
    try { await approveCert({ targetUserId: userId, type }); addToast(`${type} approved!`, "success"); }
    catch (e: any) { addToast(e.message || "Failed to approve.", "error"); }
  };
  const handleReject = async (userId: Id<"users">, type: "junior" | "advanced" | "mealAllowance") => {
    try { await rejectCert({ targetUserId: userId, type }); addToast(`${type} rejected.`, "success"); }
    catch (e: any) { addToast(e.message || "Failed to reject.", "error"); }
  };

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;
    setMealUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await result.json();
      await submitMealAllowance({ targetUserId: selectedUserId, storageId });
      addToast("Meal allowance uploaded successfully and set to pending.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to upload meal allowance", "error");
    } finally {
      setMealUploading(false);
      if (mealInputRef.current) mealInputRef.current.value = "";
    }
  };

  const handleCreateUser = async () => {
    if (!createEmail.trim()) { addToast("Email is required.", "error"); return; }
    if (!isValidEmail(createEmail)) { addToast("Please enter a valid email address.", "error"); return; }
    if (!createPassword.trim() || createPassword.length < 8) { addToast("Password must be at least 8 characters.", "error"); return; }
    setCreating(true);
    try {
      await adminCreateUser({ email: createEmail, password: createPassword });
      addToast(`User "${createEmail}" created successfully!`, "success");
      
      // Open success copy modal
      setSuccessGenerated({ email: createEmail, pw: createPassword });
      setHasCopiedGenerated(false);
      
      setCreateModal(false); 
      setCreateEmail(""); 
      setCreatePassword("");
    } catch (e: any) { addToast(e.message || "Failed to create user.", "error"); }
    finally { setCreating(false); }
  };

  const handleCloseSuccessModal = () => {
    if (!hasCopiedGenerated) {
      if (!window.confirm("You haven't copied the new credentials yet. Are you sure you want to close this and return to the manage users page?")) {
        return;
      }
    }
    setSuccessGenerated(null);
  };

  const handleCopyNewAccountCredentials = () => {
    if (!successGenerated) return;
    const textToCopy = `Account Created for LancoTrading:\nEmail: ${successGenerated.email}\nPassword: ${successGenerated.pw}`;
    navigator.clipboard.writeText(textToCopy);
    setHasCopiedGenerated(true);
    addToast("Credentials copied to clipboard!", "success");
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUser) return;
    if (!resetPassword.trim() || resetPassword.length < 8) { addToast("Password must be at least 8 characters.", "error"); return; }
    setResetting(true);
    try {
      await adminResetPassword({ email: selectedUser.email!, newPassword: resetPassword });
      addToast(`Password for "${selectedUser.email}" reset successfully!`, "success");
      
      // Also open success copy modal for the reset password
      setSuccessGenerated({ email: selectedUser.email!, pw: resetPassword });
      setHasCopiedGenerated(false);
      
      setResetModal(false);
    } catch (e: any) { addToast(e.message || "Failed to reset password.", "error"); }
    finally { setResetting(false); }
  };

  if (users === undefined) {
    return <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#229799]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-950 text-[#424242] dark:text-gray-200 p-5 pb-20 transition-colors">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Success Account Generated Modal ── */}
      {successGenerated && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-slide-in" onClick={handleCloseSuccessModal}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-8 relative shadow-2xl border border-emerald-500/30 overflow-hidden" onClick={(e) => e.stopPropagation()}>
             {/* Decorative Background Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl opacity-50 pointer-events-none rounded-full" />
             
             <button onClick={handleCloseSuccessModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><X size={20} /></button>
             
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                   <UserCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 px-4">
                  The account has been fully provisioned and is ready for use. Please securely save the credentials below.
                </p>

                <div className="w-full bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 text-left">
                   <div className="mb-3">
                      <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 block mb-1">Email</span>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{successGenerated.email}</div>
                   </div>
                   <div>
                      <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 block mb-1">Password</span>
                      <div className="font-mono text-gray-800 dark:text-gray-200 bg-gray-200/50 dark:bg-gray-900 px-3 py-2 rounded-lg break-all">
                        {successGenerated.pw}
                      </div>
                   </div>
                </div>

                <button
                  onClick={handleCopyNewAccountCredentials}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all shadow-md ${
                    hasCopiedGenerated 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30" 
                      : "bg-[#3B82F6] hover:bg-blue-600 text-white shadow-blue-500/30"
                  }`}
                >
                  {hasCopiedGenerated ? <Check size={20} /> : <Copy size={20} />}
                  {hasCopiedGenerated ? "Credentials Copied" : "Copy Credentials"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* ── Create User Modal ── */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setCreateModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">Create New User</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">The new account will be created with the "user" role.</p>

            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className={`w-full border rounded-xl p-3 mb-1 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition focus:border-[#3B82F6] dark:focus:border-[#60A5FA] ${createEmail && !isValidEmail(createEmail) ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"}`}
            />
            {createEmail && !isValidEmail(createEmail) && <p className="text-red-500 text-xs mb-2">Invalid email format.</p>}
            {(!createEmail || isValidEmail(createEmail)) && <div className="mb-3" />}

            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1 block">Password</label>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder="Min 8 characters"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-[#3B82F6] dark:focus:border-[#60A5FA] transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(createPassword); setCopiedPw(true); setTimeout(() => setCopiedPw(false), 2000); }}
                disabled={!createPassword}
                title="Copy password"
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-30"
              >
                {copiedPw ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCreatePassword(generateStrongPassword())}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA] hover:text-blue-700 dark:hover:text-blue-300 mb-5 transition"
            >
              <Wand2 size={14} /> Auto-generate strong password
            </button>

            <button
              onClick={handleCreateUser}
              disabled={creating}
              className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl py-3 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {creating && <Loader2 size={18} className="animate-spin" />} Create Account
            </button>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setResetModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl border border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setResetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><X size={20} /></button>
            <h2 className="text-lg font-bold mb-1 text-gray-800 dark:text-white">Reset Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">For: <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedUser.email}</span></p>

            <div className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder="New password (min 8 chars)"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-red-400 dark:focus:border-red-500 transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setResetPassword(generateStrongPassword())}
                title="Auto-generate"
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Wand2 size={16} className="text-gray-400" />
              </button>
            </div>
            
            <button
              onClick={handleResetPasswordSubmit}
              disabled={resetting}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 mt-4 font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {resetting && <Loader2 size={18} className="animate-spin" />} Confirm Reset
            </button>
          </div>
        </div>
      )}

      {/* ── User Details Modal ── */}
      {selectedUserId && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelectedUserId(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6 relative mt-10 mb-10 shadow-2xl border border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedUserId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><X size={20} /></button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">User Details</h2>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
               <div>
                  <div className="font-semibold text-gray-800 dark:text-white">{selectedUser.email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedUser._id}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-bold uppercase mt-1">{selectedUser.role || "USER"}</div>
               </div>
               <button onClick={() => { setResetPassword(""); setResetModal(true); }} className="flex flex-col items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-3 py-2 rounded-lg transition">
                  <KeySquare size={18} />
                  <span className="text-xs font-bold">Reset Password</span>
               </button>
            </div>

            {/* Junior Cert */}
            <h3 className="font-bold text-lg mb-3 border-b border-gray-200 dark:border-gray-700 pb-1 text-gray-700 dark:text-gray-300">Junior Certification</h3>
            {selectedUser.juniorCertification ? (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block">Status</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser.juniorCertification.status}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block">Full Name</span> <span className="dark:text-gray-200">{selectedUser.juniorCertification.fullName}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block">Birthday</span> <span className="dark:text-gray-200">{selectedUser.juniorCertification.birthday}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block">ID Number</span> <span className="dark:text-gray-200">{selectedUser.juniorCertification.idNumber}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block">Location</span> <span className="dark:text-gray-200">{selectedUser.juniorCertification.city}, {selectedUser.juniorCertification.province}, {selectedUser.juniorCertification.country}</span></div>
              </div>
            ) : <div className="text-gray-400 dark:text-gray-500 mb-6 italic">No junior certification submitted.</div>}

            {/* Advanced Cert */}
            <h3 className="font-bold text-lg mb-3 border-b border-gray-200 dark:border-gray-700 pb-1 text-gray-700 dark:text-gray-300">Advanced Certification</h3>
            {selectedUser.advancedCertification ? (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-4 mb-6">
                <div><span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block mb-1">Status</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser.advancedCertification.status}</span></div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 block">ID Card Front</span>
                     {(selectedUser.advancedCertification as any).idCardFrontUrl && (
                        <a href={(selectedUser.advancedCertification as any).idCardFrontUrl} target="_blank" rel="noreferrer">
                          <img src={(selectedUser.advancedCertification as any).idCardFrontUrl} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-cover aspect-video hover:opacity-80 transition" alt="ID Front" />
                        </a>
                     )}
                   </div>
                   <div>
                     <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 block">Holding ID</span>
                     {(selectedUser.advancedCertification as any).holdingIdUrl && (
                        <a href={(selectedUser.advancedCertification as any).holdingIdUrl} target="_blank" rel="noreferrer">
                          <img src={(selectedUser.advancedCertification as any).holdingIdUrl} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-cover aspect-[3/4] hover:opacity-80 transition" alt="Holding ID" />
                        </a>
                     )}
                   </div>
                </div>
              </div>
            ) : <div className="text-gray-400 dark:text-gray-500 italic mb-6">No advanced certification submitted.</div>}

            {/* Meal Allowance Reimbursement */}
            <h3 className="font-bold text-lg mb-3 border-b border-gray-200 dark:border-gray-700 pb-1 text-gray-700 dark:text-gray-300 flex justify-between items-center">
              <span>Meal Allowance Reimbursement</span>
              {selectedUser.mealAllowance?.status !== 'verified' && (
                <div>
                  <input type="file" ref={mealInputRef} className="hidden" accept="image/*" onChange={handleMealUpload} />
                  <button onClick={() => mealInputRef.current?.click()} disabled={mealUploading} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm transition">
                    {mealUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    {mealUploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              )}
            </h3>
            
            {!selectedUser.mealAllowance || selectedUser.mealAllowance.status === "unverified" ? (
              <div className="text-gray-400 dark:text-gray-500 italic pb-2">No meal allowance uploaded by administrator yet.</div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                   <div>
                     <span className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold block mb-1">Status</span>
                     <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{selectedUser.mealAllowance.status}</span>
                   </div>
                   {selectedUser.mealAllowance.status === "pending" && (
                     <div className="flex gap-2">
                        <button onClick={() => handleApprove(selectedUser._id, "mealAllowance")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition">Approve</button>
                        <button onClick={() => handleReject(selectedUser._id, "mealAllowance")} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition">Reject</button>
                     </div>
                   )}
                 </div>
                 {(selectedUser.mealAllowance as any).mealAllowanceUrl && (
                   <div>
                     <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2 block">Uploaded Receipt / Document</span>
                     <img src={(selectedUser.mealAllowance as any).mealAllowanceUrl} className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 object-cover" alt="Meal Allowance" />
                   </div>
                 )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Main View ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <a href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </a>
          <h1 className="text-2xl font-bold ml-4 text-gray-800 dark:text-white">Manage Users</h1>
        </div>
        <button onClick={() => { setCreateModal(true); setCopiedPw(false); }} className="flex items-center gap-2 bg-[#229799] hover:bg-[#1d8587] text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition">
          <UserPlus size={18} /> Create New User
        </button>
      </div>

      {/* ── Search / Filter / Sort Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-sm outline-none focus:border-[#229799] dark:focus:border-[#48CFCB] transition"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
              filterBy !== "all"
                ? "border-[#229799] bg-[#229799]/10 text-[#229799] dark:text-[#48CFCB] dark:border-[#48CFCB]"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
          {showFilterMenu && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 animate-slide-in">
              {[
                { value: "all", label: "All Users" },
                { value: "admin", label: "Admins Only" },
                { value: "user", label: "Users Only" },
                { value: "has_pending", label: "Has Pending Cert" },
                { value: "all_verified", label: "Fully Verified" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterBy(opt.value); setShowFilterMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    filterBy === opt.value
                      ? "bg-[#229799]/10 text-[#229799] dark:text-[#48CFCB] font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
              sortBy !== "latest"
                ? "border-[#229799] bg-[#229799]/10 text-[#229799] dark:text-[#48CFCB] dark:border-[#48CFCB]"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <ArrowUpDown size={16} /> Sort
          </button>
          {showSortMenu && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 animate-slide-in">
              {[
                { value: "latest", label: "Latest Created" },
                { value: "oldest", label: "Oldest Created" },
                { value: "email_asc", label: "Email (A → Z)" },
                { value: "email_desc", label: "Email (Z → A)" },
                { value: "role", label: "Role (Admin First)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    sortBy === opt.value
                      ? "bg-[#229799]/10 text-[#229799] dark:text-[#48CFCB] font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Processed Users ── */}
      {(() => {
        // Filter
        let filtered = [...(users || [])] as any[];
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((u: any) => (u.email || "").toLowerCase().includes(q));
        }
        if (filterBy === "admin") filtered = filtered.filter((u: any) => u.role === "admin");
        else if (filterBy === "user") filtered = filtered.filter((u: any) => u.role !== "admin");
        else if (filterBy === "has_pending") filtered = filtered.filter((u: any) =>
          u.juniorCertification?.status === "pending" || u.advancedCertification?.status === "pending" || u.mealAllowance?.status === "pending"
        );
        else if (filterBy === "all_verified") filtered = filtered.filter((u: any) =>
          u.juniorCertification?.status === "verified" && u.advancedCertification?.status === "verified"
        );

        // Sort
        if (sortBy === "latest") filtered.sort((a: any, b: any) => (b._creationTime || 0) - (a._creationTime || 0));
        else if (sortBy === "oldest") filtered.sort((a: any, b: any) => (a._creationTime || 0) - (b._creationTime || 0));
        else if (sortBy === "email_asc") filtered.sort((a: any, b: any) => (a.email || "").localeCompare(b.email || ""));
        else if (sortBy === "email_desc") filtered.sort((a: any, b: any) => (b.email || "").localeCompare(a.email || ""));
        else if (sortBy === "role") filtered.sort((a: any, b: any) => (a.role === "admin" ? -1 : 1) - (b.role === "admin" ? -1 : 1));

        return (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                    <th className="px-6 py-4 font-medium">Junior Cert</th>
                    <th className="px-6 py-4 font-medium">Advanced Cert</th>
                    <th className="px-6 py-4 font-medium">Meal Allowance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((u: any) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{u.email || "No email"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide ${
                          u.role === "admin"
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                            : "bg-[#48CFCB]/20 text-[#229799] dark:text-[#48CFCB]"
                        }`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <button onClick={() => setSelectedUserId(u._id)} className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                            <Eye size={14} /> View
                         </button>
                      </td>
                      <td className="px-6 py-4">
                        {u.juniorCertification?.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <StatusBadge status="pending" />
                            <button onClick={() => handleApprove(u._id, "junior")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2 py-1 text-xs transition">✓</button>
                            <button onClick={() => handleReject(u._id, "junior")} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 text-xs transition">✗</button>
                          </div>
                        ) : (
                          <StatusBadge status={u.juniorCertification?.status || "unverified"} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.advancedCertification?.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <StatusBadge status="pending" />
                            <button onClick={() => handleApprove(u._id, "advanced")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2 py-1 text-xs transition">✓</button>
                            <button onClick={() => handleReject(u._id, "advanced")} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 text-xs transition">✗</button>
                          </div>
                        ) : (
                          <StatusBadge status={u.advancedCertification?.status || "unverified"} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.mealAllowance?.status === "pending" ? (
                          <StatusBadge status="pending" />
                        ) : (
                          <StatusBadge status={u.mealAllowance?.status || "unverified"} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery || filterBy !== "all" ? "No users match your search/filter." : "No users found."}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
