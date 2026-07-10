import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ArrowLeft, UserPlus, Eye, X, KeySquare, Wand2, CheckCircle, AlertCircle, Copy, Check, Loader2, UserCheck } from "lucide-react";

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

  // @ts-ignore
  const approveCert = useMutation(api.certifications.approveCertification);
  // @ts-ignore
  const rejectCert = useMutation(api.certifications.rejectCertification);
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
  const handleApprove = async (userId: Id<"users">, type: "junior" | "advanced") => {
    try { await approveCert({ targetUserId: userId, type }); addToast(`${type} certification approved!`, "success"); }
    catch (e: any) { addToast(e.message || "Failed to approve.", "error"); }
  };
  const handleReject = async (userId: Id<"users">, type: "junior" | "advanced") => {
    try { await rejectCert({ targetUserId: userId, type }); addToast(`${type} certification rejected.`, "success"); }
    catch (e: any) { addToast(e.message || "Failed to reject.", "error"); }
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

            <h3 className="font-bold text-lg mb-3 border-b border-gray-200 dark:border-gray-700 pb-1 text-gray-700 dark:text-gray-300">Advanced Certification</h3>
            {selectedUser.advancedCertification ? (
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
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
            ) : <div className="text-gray-400 dark:text-gray-500 italic">No advanced certification submitted.</div>}
          </div>
        </div>
      )}

      {/* ── Main View ── */}
      <div className="flex items-center mb-8">
        <a href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
          <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
        </a>
        <h1 className="text-2xl font-bold ml-4 text-gray-800 dark:text-white">Manage Users</h1>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => { setCreateModal(true); setCopiedPw(false); }} className="flex items-center gap-2 bg-[#229799] hover:bg-[#1d8587] text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition">
          <UserPlus size={18} /> Create New User
        </button>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u: any) => (
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
                  <td className="px-6 py-4 text-xs font-semibold">
                    {u.juniorCertification?.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(u._id, "junior")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 transition">Approve</button>
                        <button onClick={() => handleReject(u._id, "junior")} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 transition">Reject</button>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{u.juniorCertification?.status || "None"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {u.advancedCertification?.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(u._id, "advanced")} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 transition">Approve</button>
                        <button onClick={() => handleReject(u._id, "advanced")} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 transition">Reject</button>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{u.advancedCertification?.status || "None"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found.</div>
          )}
        </div>
      </div>

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
