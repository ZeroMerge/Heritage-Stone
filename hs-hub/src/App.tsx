import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar.tsx";
import { BrandList } from "./pages/BrandList.tsx";
import { TemplateGallery } from "./pages/TemplateGallery.tsx";
import { UploadTemplate } from "./pages/UploadTemplate.tsx";
import { LivePreview } from "./pages/LivePreview.tsx";
import { TemplateToggle } from "./pages/TemplateToggle.tsx";
import { ValueMapping } from "./pages/ValueMapping.tsx";
import { CacheAdmin } from "./pages/CacheAdmin.tsx";
import { SectionLocks } from "./pages/SectionLocks.tsx";
import { Login } from "./pages/Login.tsx";
import { useAuthStore } from "./store/auth";
import { useUIStore } from "./store/ui";

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--hs-bg)]">
        <div className="w-12 h-12 border-4 border-[var(--hs-accent)]/20 border-t-[var(--hs-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const checkSession = useAuthStore((state) => state.checkSession);
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AuthGuard />}>
          <Route
            path="*"
            element={
              <div className="flex h-screen overflow-hidden bg-[var(--hs-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<BrandList />} />
                    <Route path="/templates" element={<TemplateGallery />} />
                    <Route path="/upload" element={<UploadTemplate />} />
                    <Route path="/preview" element={<LivePreview />} />
                    <Route path="/preview/:slug/:templateId" element={<LivePreview />} />
                    <Route path="/assign/:slug" element={<TemplateToggle />} />
                    <Route path="/map/:slug" element={<ValueMapping />} />
                    <Route path="/locks" element={<SectionLocks />} />
                    <Route path="/cache" element={<CacheAdmin />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
