import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { useAuthStore } from "@/store";

// Layouts
import { Layout } from "@/components/layout/Layout";
import { ProjectLayout } from "@/components/layout/ProjectLayout";

// Auth Pages
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";

// Studio Pages
import { Dashboard } from "@/pages/studio/Dashboard";
import { Projects } from "@/pages/studio/Projects";
import { Settings as StudioSettings } from "@/pages/studio/Settings";

// Project Pages
import { Overview } from "@/pages/project/Overview";
import { BrandDocument } from "@/pages/project/BrandDocument";
import { Assets as ProjectAssets } from "@/pages/project/Assets";
import { Team as ProjectTeam } from "@/pages/project/Team";
import { Activity as ProjectActivity } from "@/pages/project/Activity";
import { Chat as ProjectChat } from "@/pages/project/Chat";
import { Campaigns } from "@/pages/project/Campaigns";
import { ProjectSettings } from "@/pages/project/Settings";
import { Launch } from "@/pages/project/Launch";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Higher-order component to protect routes
 */
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--hs-accent)]/20 border-t-[var(--hs-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  // Auth Routes (Public)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },

  // Studio Routes (Protected)
  {
    path: "/studio",
    element: <AuthGuard />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "settings",
            element: <StudioSettings />,
          },
        ],
      },
    ],
  },

  // Project Specific Routes (Protected)
  {
    path: "/project/:projectId",
    element: <AuthGuard />,
    children: [
      {
        element: <ProjectLayout />,
        children: [
          {
            index: true,
            element: <Overview />,
          },
          {
            path: "brand-document",
            element: <BrandDocument />,
          },
          {
            path: "assets",
            element: <ProjectAssets />,
          },
          {
            path: "team",
            element: <ProjectTeam />,
          },
          {
            path: "activity",
            element: <ProjectActivity />,
          },
          {
            path: "chat",
            element: <ProjectChat />,
          },
          {
            path: "campaigns",
            element: <Campaigns />,
          },
          {
            path: "settings",
            element: <ProjectSettings />,
          },
          {
            path: "launch",
            element: <Launch />,
          },
        ],
      },
    ],
  },

  // Redirects
  {
    path: "/",
    element: <Navigate to="/studio" replace />,
  },
]);

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata.firstName || "",
          lastName: session.user.user_metadata.lastName || "",
          avatarUrl: session.user.user_metadata.avatarUrl || null,
          role: session.user.user_metadata.role || "admin",
          createdAt: session.user.created_at,
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        });
      } else {
        setUser(null);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.user_metadata.firstName || "",
          lastName: session.user.user_metadata.lastName || "",
          avatarUrl: session.user.user_metadata.avatarUrl || null,
          role: session.user.user_metadata.role || "admin",
          createdAt: session.user.created_at,
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
