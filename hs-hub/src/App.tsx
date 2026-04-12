// hs-hub/src/App.tsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Sidebar }         from "./components/Sidebar.tsx";
import { Topbar }          from "./components/Topbar.tsx";
import { BottomNav }       from "./components/BottomNav.tsx";
import { BrandList }       from "./pages/BrandList.tsx";
import { TemplateGallery } from "./pages/TemplateGallery.tsx";
import { UploadTemplate }  from "./pages/UploadTemplate.tsx";
import { LivePreview }     from "./pages/LivePreview.tsx";
import { TemplateToggle }  from "./pages/TemplateToggle.tsx";
import { ValueMapping }    from "./pages/ValueMapping.tsx";
import { CacheAdmin }      from "./pages/CacheAdmin.tsx";
import { SectionLocks }    from "./pages/SectionLocks.tsx";
import { Login }           from "./pages/Login.tsx";
import ClientLogin         from "./pages/ClientLogin.tsx";
import { useAuthStore }    from "./store/auth";

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-10 h-10 border-2 border-[var(--hs-accent-soft)] border-t-[var(--hs-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppShell() {
  return (
    <div className="app-shell">
      {/* Mobile topbar (Love) */}
      <Topbar />

      {/* Sidebar + content */}
      <div className="shell-body">
        {/* Sidebar (Cherished icons / Goldmine full) */}
        <Sidebar />

        {/* Scrollable page content */}
        <main className="main-content">
          <Routes>
            <Route path="/"                       element={<BrandList />} />
            <Route path="/templates"              element={<TemplateGallery />} />
            <Route path="/upload"                 element={<UploadTemplate />} />
            <Route path="/preview"                element={<LivePreview />} />
            <Route path="/preview/:slug/:templateId" element={<LivePreview />} />
            <Route path="/assign/:slug"           element={<TemplateToggle />} />
            <Route path="/map/:slug"              element={<ValueMapping />} />
            <Route path="/locks"                  element={<SectionLocks />} />
            <Route path="/cache"                  element={<CacheAdmin />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav (Love) */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
    // Hub defaults to light mode
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    }
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route element={<AuthGuard />}>
          <Route path="*" element={<AppShell />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
