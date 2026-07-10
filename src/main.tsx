import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";
import SignIn from "./SignIn.tsx";
import Dashboard from "./Dashboard.tsx";
import Profile from "./Profile.tsx";
import AdminManageUsers from "./AdminManageUsers.tsx";
import Authentication from "./Authentication.tsx";
import JuniorCertification from "./JuniorCertification.tsx";
import AdvancedCertification from "./AdvancedCertification.tsx";
import MyAssets from "./MyAssets.tsx";
import Withdraw from "./Withdraw.tsx";
import Transfer from "./Transfer.tsx";
import WithdrawalRecords from "./WithdrawalRecords.tsx";
import SecurityCenter from "./SecurityCenter.tsx";
import FundPassword from "./FundPassword.tsx";
import Recharge from "./Recharge.tsx";
import RechargeDetails from "./RechargeDetails.tsx";
import RechargeRecords from "./RechargeRecords.tsx";
import AdminDeposit from "./AdminDeposit.tsx";
import AdminDepositLogs from "./AdminDepositLogs.tsx";
import AdminWalletConfig from "./AdminWalletConfig.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (path === "/signin") return <SignIn />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/profile") return <Profile />;
  if (path === "/manage-users") return <AdminManageUsers />;
  if (path === "/authentication") return <Authentication />;
  if (path === "/junior-certification") return <JuniorCertification />;
  if (path === "/advanced-certification") return <AdvancedCertification />;
  if (path === "/my-assets") return <MyAssets />;
  if (path === "/withdraw") return <Withdraw />;
  if (path === "/transfer") return <Transfer />;
  if (path === "/withdrawal-records") return <WithdrawalRecords />;
  if (path === "/security-center") return <SecurityCenter />;
  if (path === "/fund-password") return <FundPassword />;
  if (path === "/recharge") return <Recharge />;
  if (path === "/recharge-records") return <RechargeRecords />;
  if (path.startsWith("/recharge/")) return <RechargeDetails />;
  if (path === "/admin/deposit") return <AdminDeposit />;
  if (path === "/admin/deposit-logs") return <AdminDepositLogs />;
  if (path === "/admin/wallet-config") return <AdminWalletConfig />;

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <Router />
    </ConvexAuthProvider>
  </StrictMode>,
);
