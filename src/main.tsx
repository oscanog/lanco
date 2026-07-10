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

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <Router />
    </ConvexAuthProvider>
  </StrictMode>,
);
