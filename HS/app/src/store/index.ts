import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

import type {
  Project,
  ProjectStatus,
  BrandSection,
  SectionKey,
  Asset,
  AssetCategory,
  StudioMember,
  ClientMember,
  ActivityEvent,
  ChatMessage,
  BrandRequest,
  DashboardStats,
  AttentionItem,
  StudioUser,
  ChapterKey,
  PermissionLevel,
  SupabaseSectionType,
  PortalSettings,
} from "@/types";

// ─── Cache Invalidation Helper ────────────────────────────────────────────────
const invalidatePortalCache = async (slug: string) => {
  const portalUrl = import.meta.env.VITE_PORTAL_URL;
  const hubSecret = import.meta.env.VITE_HUB_SECRET;

  if (!portalUrl || !hubSecret) {
    console.warn("[Cache] Missing VITE_PORTAL_URL or VITE_HUB_SECRET. Invalidation skipped.");
    return;
  }

  try {
    await fetch(`${portalUrl}/invalidate/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-secret': hubSecret,
      },
      body: JSON.stringify({ reason: 'Studio save' }),
    });
    console.info(`[Cache] Invalidated portal cache for: ${slug}`);
  } catch (err) {
    console.error("[Cache] Failed to invalidate portal cache:", err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UI State
// ═══════════════════════════════════════════════════════════════════════════════

interface UIState {
  sidebarCollapsed: boolean;
  activeProjectId: string | null;
  activeTab: string;
  isNewProjectModalOpen: boolean;
  isInviteModalOpen: boolean;
  isPublishModalOpen: boolean;
  isSearchModalOpen: boolean;
  isConfirmModalOpen: boolean;
  confirmModalConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    type?: "danger" | "warning" | "info";
  } | null;
  searchQuery: string;
  projectFilter: ProjectStatus | "all";
  projectView: "grid" | "list";
  theme: "light" | "dark";
  toast: { message: string; type: "success" | "error" | "info" } | null;

  toggleSidebar: () => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setInviteModalOpen: (open: boolean) => void;
  setPublishModalOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setConfirmModalOpen: (open: boolean) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    type?: "danger" | "warning" | "info";
  }) => void;
  setSearchQuery: (query: string) => void;
  setProjectFilter: (filter: ProjectStatus | "all") => void;
  setProjectView: (view: "grid" | "list") => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeProjectId: null,
      activeTab: "overview",
      isNewProjectModalOpen: false,
      isInviteModalOpen: false,
      isPublishModalOpen: false,
      isSearchModalOpen: false,
      isConfirmModalOpen: false,
      confirmModalConfig: null,
      searchQuery: "",
      projectFilter: "all",
      projectView: "grid",
      theme: "light",
      toast: null,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setNewProjectModalOpen: (open) => set({ isNewProjectModalOpen: open }),
      setInviteModalOpen: (open) => set({ isInviteModalOpen: open }),
      setPublishModalOpen: (open) => set({ isPublishModalOpen: open }),
      setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
      setConfirmModalOpen: (open) => set({ isConfirmModalOpen: open }),
      showConfirm: (config) => set({ confirmModalConfig: config, isConfirmModalOpen: true }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setProjectFilter: (filter) => set({ projectFilter: filter }),
      setProjectView: (view) => set({ projectView: view }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      showToast: (message, type) => set({ toast: { message, type } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: "hs-studio-ui",
      partialize: (state) => ({ 
        theme: state.theme, 
        sidebarCollapsed: state.sidebarCollapsed,
        projectView: state.projectView
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Projects State
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  brandSections: Record<string, BrandSection[]>;
  assets: Record<string, Asset[]>;
  studioMembers: StudioMember[];
  clientMembers: Record<string, ClientMember[]>;
  activityEvents: Record<string, ActivityEvent[]>;
  chatMessages: Record<string, ChatMessage[]>;
  brandRequests: Record<string, BrandRequest[]>;
  isLoading: boolean;
  saveIndicator: "idle" | "saving" | "saved" | "error";
  hasFetched: boolean;

  setProjects: (projects: Project[]) => void;
  createProject: (data: { name: string; industry?: string; description?: string; brandColour?: string }) => Promise<string | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
  filteredProjects: () => Project[];
  setBrandSections: (projectId: string, sections: BrandSection[]) => void;
  updateBrandSection: (
    projectId: string,
    sectionKey: SectionKey,
    updates: Partial<BrandSection>
  ) => void;
  setAssets: (projectId: string, assets: Asset[]) => void;
  addAsset: (projectId: string, asset: Asset) => Promise<void>;
  deleteAsset: (projectId: string, assetId: string) => Promise<void>;
  setStudioMembers: (members: StudioMember[]) => void;
  setClientMembers: (projectId: string, members: ClientMember[]) => void;
  addClientMember: (projectId: string, member: Partial<ClientMember>) => Promise<void>;
  deleteClientMember: (projectId: string, memberId: string) => Promise<void>;
  setActivityEvents: (projectId: string, events: ActivityEvent[]) => void;
  addActivityEvent: (projectId: string, event: Partial<ActivityEvent>) => Promise<void>;
  setChatMessages: (projectId: string, messages: ChatMessage[]) => void;
  addChatMessage: (projectId: string, message: Partial<ChatMessage>) => Promise<void>;
  setBrandRequests: (projectId: string, requests: BrandRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setSaveIndicator: (state: "idle" | "saving" | "saved" | "error") => void;
  publishProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  fetchAssets: (projectId: string) => Promise<void>;
  fetchClientMembers: (projectId: string) => Promise<void>;
  fetchChatMessages: (projectId: string) => Promise<void>;
  fetchActivityEvents: (projectId: string) => Promise<void>;
  updateProjectSection: (projectId: string, sectionType: SupabaseSectionType, data: Record<string, unknown>) => Promise<void>;
}

const defaultPortalSettings: PortalSettings = {
  url: "",
  passwordProtected: false,
  password: null,
  customDomain: null,
  showStudioCredit: true,
  theme: "auto"
};

// Supabase row shape — snake_case columns returned by PostgREST
type SupabaseProjectRow = Record<string, unknown>;

const mapSupabaseProjectToProject = (p: SupabaseProjectRow): Project => ({
  id: p.id as string,
  name: p.brand_name as string,
  clientName: (p.client_name ?? p.brand_name ?? "New Client") as string,
  clientSlug: ((p.slug ?? (p.brand_name as string | undefined)?.toLowerCase().replace(/\s+/g, '-')) ?? "") as string,
  industry: (p.industry ?? "") as string,
  description: (p.description ?? "") as string,
  status: p.status as ProjectStatus,
  portalTemplate: (p.portal_template ?? "meridian") as "meridian",
  brandColour: (p.brand_colour ?? "#C9A96E") as string,
  secondaryColour: (p.secondary_colour ?? "#0F0F0F") as string,
  goLiveDate: (p.go_live_date ?? null) as string | null,
  launchedAt: (p.launched_at ?? null) as string | null,
  brandHealth: (p.brand_health ?? 100) as number,
  healthScore: (p.health_score ?? 100) as number,
  version: (p.version ?? "1.0") as string,
  memberCount: (p.member_count ?? 0) as number,
  isPublished: (p.is_published ?? false) as boolean,
  subBrands: (p.sub_brands ?? []) as Project["subBrands"],
  brandJson: (p.brand_json ?? null) as Record<string, unknown> | null,
  portalSettings: (p.portal_settings ?? defaultPortalSettings) as Project["portalSettings"],
  sectionVisibility: (p.section_visibility ?? []) as Project["sectionVisibility"],
  approvalStates: (p.approval_states ?? []) as Project["approvalStates"],
  launchTasks: (p.launch_tasks ?? []) as Project["launchTasks"],
  versionHistory: (p.version_history ?? []) as Project["versionHistory"],
  chatThreads: (p.chat_threads ?? []) as Project["chatThreads"],
  createdAt: p.created_at as string,
  updatedAt: p.updated_at as string,
});

// Helper to convert camelCase object keys to snake_case for Supabase
const camelToSnake = (obj: Record<string, unknown>): Record<string, unknown> => {
  const snakeObj: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  selectedProject: null,
  brandSections: {},
  assets: {},
  studioMembers: [],
  clientMembers: {},
  activityEvents: {},
  chatMessages: {},
  brandRequests: {},
  isLoading: false,
  saveIndicator: "idle",
  hasFetched: false,

  setProjects: (projects) => set({ projects, hasFetched: true }),

  createProject: async (data) => {
    try {
      set({ isLoading: true });
      // Auto-generate slug from brand name using the utility format
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { data: project, error } = await supabase
        .from("brands")
        .insert({
          brand_name: data.name,
          slug: slug,
          client_name: data.name,
          industry: data.industry,
          description: data.description,
          status: "active",
          is_published: false,
          version: "1.0",
          brand_colour: data.brandColour || "#C9A96E",
        })
        .select()
        .single();

      if (error) throw error;

      const newProject = mapSupabaseProjectToProject(project);

      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false
      }));

      // Seed all 10 default brand sections for this brand
      // Canonical keys: introduction, strategy, logo, color_palette, typography, photography, voice_tone, messaging, icons, resources
      const SECTION_TYPES = [
        'introduction', 'strategy', 'logo', 'color_palette', 'typography',
        'photography', 'voice_tone', 'messaging', 'icons', 'resources'
      ];
      await supabase.from("brand_sections").insert(
        SECTION_TYPES.map((section_type, index) => ({
          brand_id: project.id,
          section_type,
          is_enabled: true,
          sort_order: index + 1,
        }))
      );

      // Log activity
      await get().addActivityEvent(project.id, {
        eventType: "project_created",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: `Created new project: ${data.name}`
      });

      useUIStore.getState().showToast("Project created successfully", "success");
      return project.id;
    } catch (err) {
      console.error("Error creating project:", err);
      set({ isLoading: false });
      useUIStore.getState().showToast("Failed to create project", "error");
      return null;
    }
  },

  updateProject: async (id, updates) => {
    try {
      const supabaseUpdates: Record<string, unknown> = {};
      // Map camelCase Project fields → canonical Supabase snake_case columns
      if (updates.name) supabaseUpdates.brand_name = updates.name;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.industry) supabaseUpdates.industry = updates.industry;
      if (updates.isPublished !== undefined) supabaseUpdates.is_published = updates.isPublished;
      if (updates.portalSettings) supabaseUpdates.portal_settings = updates.portalSettings;
      if (updates.subBrands) supabaseUpdates.sub_brands = updates.subBrands;
      if (updates.launchTasks) supabaseUpdates.launch_tasks = updates.launchTasks;
      if (updates.brandColour) supabaseUpdates.brand_colour = updates.brandColour;
      if (updates.secondaryColour) supabaseUpdates.secondary_colour = updates.secondaryColour;
      if (updates.clientName) supabaseUpdates.client_name = updates.clientName;
      if (updates.goLiveDate) supabaseUpdates.go_live_date = updates.goLiveDate;
      supabaseUpdates.updated_at = new Date().toISOString();

      if (Object.keys(supabaseUpdates).length > 0) {
        const { error } = await supabase
          .from("brands")
          .update(supabaseUpdates)
          .eq("id", id);

        if (error) throw error;
      }

      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        selectedProject: state.selectedProject?.id === id ? { ...state.selectedProject, ...updates } : state.selectedProject
      }));

      useUIStore.getState().showToast("Project updated successfully", "success");

      // Invalidate portal cache
      const project = get().projects.find(p => p.id === id);
      if (project?.clientSlug) {
        invalidatePortalCache(project.clientSlug);
      }
    } catch (err) {
      console.error("Error updating project:", err);
      useUIStore.getState().showToast("Failed to update project", "error");
    }
  },

  deleteProject: async (id) => {
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject
      }));
      useUIStore.getState().showToast("Project deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting project:", err);
      useUIStore.getState().showToast("Failed to delete project", "error");
    }
  },

  archiveProject: async (id) => {
    try {
      await get().updateProject(id, { status: "archived" });
      useUIStore.getState().showToast("Project archived", "info");
    } catch (err) {
      console.error("Error archiving project:", err);
      useUIStore.getState().showToast("Failed to archive project", "error");
    }
  },

  selectProject: (project) => set({ selectedProject: project }),

  filteredProjects: () => {
    const { projects } = get();
    const { searchQuery, projectFilter } = useUIStore.getState();

    return projects.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const terms = query.split(/\s+/);
      
      const searchStr = `${p.name} ${p.clientName} ${p.industry}`.toLowerCase();
      const matchesSearch = terms.every(term => searchStr.includes(term));
      
      const matchesFilter = projectFilter === "all" || p.status === projectFilter;
      return matchesSearch && matchesFilter;
    });
  },

  setBrandSections: (projectId, sections) =>
    set((state) => ({
      brandSections: { ...state.brandSections, [projectId]: sections }
    })),

  updateBrandSection: (projectId, sectionKey, updates) =>
    set((state) => {
      const projectSections = state.brandSections[projectId] || [];
      const updatedSections = projectSections.map((s: BrandSection) =>
        s.id === sectionKey ? { ...s, ...updates } : s
      );
      return {
        brandSections: { ...state.brandSections, [projectId]: updatedSections }
      };
    }),

  setAssets: (projectId, assets) =>
    set((state) => ({
      assets: { ...state.assets, [projectId]: assets }
    })),

  fetchAssets: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from("project_assets")
        .select("*")
        .eq("brand_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items: Asset[] = (data || []).map((a: any) => ({
        id: a.id,
        projectId: a.brand_id,
        name: a.name,
        fileUrl: a.file_url,
        fileType: a.file_type,
        fileSizeBytes: Number(a.file_size_bytes || 0),
        category: a.category as AssetCategory,
        visibleToClient: a.visible_to_client,
        uploadedBy: a.uploaded_by,
        createdAt: a.created_at
      }));

      set((state) => ({
        assets: { ...state.assets, [projectId]: items }
      }));
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  },

  deleteAsset: async (projectId, assetId) => {
    try {
      const { error } = await supabase.from("project_assets").delete().eq("id", assetId);
      if (error) throw error;

      set((state) => ({
        assets: {
          ...state.assets,
          [projectId]: (state.assets[projectId] || []).filter((a) => a.id !== assetId),
        },
      }));

      await get().addActivityEvent(projectId, {
        eventType: "asset_deleted",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: "Deleted a brand asset.",
      });
      
      useUIStore.getState().showToast("Asset deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting asset:", err);
      useUIStore.getState().showToast("Failed to delete asset", "error");
    }
  },

  addAsset: async (projectId, asset) => {
    try {
      const newAsset = {
        brand_id: projectId,
        name: asset.name,
        file_url: asset.fileUrl,
        file_type: asset.fileType,
        file_size_bytes: asset.fileSizeBytes,
        category: asset.category,
        visible_to_client: asset.visibleToClient,
        uploaded_by: asset.uploadedBy,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("project_assets")
        .insert(newAsset)
        .select()
        .single();

      if (error) throw error;

      const mappedAsset: Asset = {
        id: data.id,
        projectId: data.project_id,
        name: data.name,
        fileUrl: data.file_url,
        fileType: data.file_type,
        fileSizeBytes: Number(data.file_size_bytes || 0),
        category: data.category as AssetCategory,
        visibleToClient: data.visible_to_client,
        uploadedBy: data.uploaded_by,
        createdAt: data.created_at
      };

      set((state) => ({
        assets: {
          ...state.assets,
          [projectId]: [...(state.assets[projectId] || []), mappedAsset]
        }
      }));

      await get().addActivityEvent(projectId, {
        eventType: "asset_uploaded",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: `Uploaded new asset: ${mappedAsset.name}`
      });

      useUIStore.getState().showToast("Asset uploaded successfully", "success");
    } catch (err) {
      console.error("Error adding asset:", err);
      useUIStore.getState().showToast("Failed to upload asset", "error");
    }
  },

  setStudioMembers: (members) => set({ studioMembers: members }),

  setClientMembers: (projectId, members) =>
    set((state) => ({
      clientMembers: { ...state.clientMembers, [projectId]: members }
    })),

  addClientMember: async (projectId, member) => {
    try {
      const newMember = {
        name: member.name,
        email: member.email,
        permission_level: member.permissionLevel,
        brand_id: projectId,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("client_members")
        .insert(newMember)
        .select()
        .single();

      if (error) throw error;

      const mappedMember: ClientMember = {
        id: data.id,
        projectId: data.brand_id,
        name: data.name,
        email: data.email,
        permissionLevel: data.permission_level,
        lastLogin: data.last_login_at,
        invitedAt: data.created_at,
        invitedBy: "Admin",
        isActive: true
      };

      set((state) => ({
        clientMembers: {
          ...state.clientMembers,
          [projectId]: [...(state.clientMembers[projectId] || []), mappedMember]
        }
      }));

      await get().addActivityEvent(projectId, {
        eventType: "member_invited",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: `Invited ${mappedMember.name} to the project.`
      });

      useUIStore.getState().showToast(`Invitation sent to ${member.email}`, "success");
    } catch (error) {
      console.error("Error adding client member:", error);
      useUIStore.getState().showToast("Failed to invite member", "error");
    }
  },

  deleteClientMember: async (projectId, memberId) => {
    try {
      const { error } = await supabase.from("client_members").delete().eq("id", memberId);
      if (error) throw error;
      set((state) => ({
        clientMembers: {
          ...state.clientMembers,
          [projectId]: (state.clientMembers[projectId] || []).filter((m) => m.id !== memberId)
        }
      }));
      await get().addActivityEvent(projectId, {
        eventType: "member_removed",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: `Removed a member from the project.`
      });

      useUIStore.getState().showToast("Member removed from project", "info");
    } catch (error) {
      console.error("Error deleting member:", error);
      useUIStore.getState().showToast("Failed to remove member", "error");
    }
  },

  setActivityEvents: (projectId, events) =>
    set((state) => ({
      activityEvents: { ...state.activityEvents, [projectId]: events }
    })),

  addActivityEvent: async (projectId, event) => {
    try {
      const { error } = await supabase.from("activity_events").insert({
        brand_id: projectId,
        action: event.eventType,
        description: event.description,
        user_name: event.actorName,
        event_type: event.eventType,
        actor_type: event.actorType,
        actor_name: event.actorName,
        section_key: event.sectionKey,
        metadata: event.metadata
      });
      if (error) throw error;
      await get().fetchActivityEvents(projectId);
    } catch (err) {
      console.error("Error adding activity event:", err);
    }
  },

  setChatMessages: (projectId, messages) =>
    set((state) => ({
      chatMessages: { ...state.chatMessages, [projectId]: messages }
    })),

  addChatMessage: async (projectId, message) => {
    try {
      const { error } = await supabase.from("messages").insert({
        brand_id: projectId,
        thread_id: message.threadId,
        sender_name: message.senderName,
        sender_type: message.senderType,
        content: message.content,
        attachments: message.attachments || [],
      });
      if (error) throw error;
      await get().fetchChatMessages(projectId);
    } catch (err) {
      console.error("Error adding chat message:", err);
    }
  },

  setBrandRequests: (projectId, requests) =>
    set((state) => ({
      brandRequests: { ...state.brandRequests, [projectId]: requests }
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setSaveIndicator: (state) => set({ saveIndicator: state }),

  publishProject: async (id) => {
    try {
      await get().updateProject(id, {
        isPublished: true,
        status: "live"
      });

      await get().addActivityEvent(id, {
        eventType: "portal_published",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        description: "Published the brand guidelines portal."
      });

      useUIStore.getState().showToast("Project published to live portal", "success");
    } catch (error) {
      console.error("Error publishing project:", error);
      useUIStore.getState().showToast("Failed to publish project", "error");
    }
  },

  fetchProjects: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const projects: Project[] = (data || []).map(mapSupabaseProjectToProject);

      set({ projects, isLoading: false, hasFetched: true });
    } catch (err) {
      console.error("Error fetching projects:", err);
      set({ isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const project = mapSupabaseProjectToProject(data);

      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
        selectedProject: project
      }));

      // Also fetch related data
      await Promise.all([
        get().fetchAssets(id),
        get().fetchActivityEvents(id),
        get().fetchChatMessages(id),
        get().fetchClientMembers(id)
      ]);
    } catch (err) {
      console.error("Error fetching project by id:", err);
    }
  },

  fetchClientMembers: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from("client_members")
        .select("*")
        .eq("brand_id", projectId);

      if (error) throw error;

      const members: ClientMember[] = (data || []).map((m: any) => ({
        id: m.id,
        projectId: m.brand_id,
        name: m.name as string,
        email: m.email as string,
        permissionLevel: m.permission_level as ClientMember["permissionLevel"],
        lastLogin: (m.last_login_at as string) ?? null,
        invitedAt: m.created_at as string,
        invitedBy: "Admin",
        isActive: true
      }));

      set((state) => ({
        clientMembers: { ...state.clientMembers, [projectId]: members }
      }));
    } catch (err) {
      console.error("Error fetching client members:", err);
    }
  },

  fetchChatMessages: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("brand_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messages: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        threadId: m.thread_id,
        senderName: m.sender_name as string,
        senderType: m.sender_type as ChatMessage["senderType"],
        content: m.content as string,
        attachments: (m.attachments as string[]) || [],
        readAt: (m.read_at as string) ?? null,
        createdAt: m.created_at as string
      }));

      set((state) => ({
        chatMessages: { ...state.chatMessages, [projectId]: messages }
      }));
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  },

  fetchActivityEvents: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*")
        .eq("brand_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const events: ActivityEvent[] = (data || []).map((e: SupabaseProjectRow) => ({
        id: e.id as string,
        projectId: e.brand_id as string,
        eventType: ((e.event_type ?? e.action) as ActivityEvent["eventType"]),
        actorType: e.actor_type as ActivityEvent["actorType"],
        actorName: (e.actor_name ?? e.user_name) as string,
        description: e.description as string,
        sectionKey: (e.section_key as ActivityEvent["sectionKey"]) ?? null,
        metadata: (e.metadata as ActivityEvent["metadata"]) ?? null,
        createdAt: e.created_at as string
      }));

      set((state) => ({
        activityEvents: { ...state.activityEvents, [projectId]: events }
      }));
    } catch (err) {
      console.error("Error fetching activity events:", err);
    }
  },

  updateProjectSection: async (projectId, sectionType, data) => {
    try {
      set({ saveIndicator: "saving" });

      // Map section type to the correct Supabase table name
      const tableMap: Record<string, string> = {
        introduction: 'brand_introductions',
        strategy: 'brand_strategies',
        voice_tone: 'brand_strategies',
        messaging: 'brand_strategies',
        logo: 'brand_logos',
        color_palette: 'brand_colors',
        typography: 'brand_typography',
        photography: 'brand_images',
        icons: 'brand_icons',
        resources: 'brand_resources',
      };

      const tableName = tableMap[sectionType] || sectionType;

      // Handle multi-row tables specifically
      if (['logo', 'color_palette', 'typography', 'resources'].includes(sectionType)) {
        await supabase.from(tableName).delete().eq('brand_id', projectId);

        let rowsToInsert: Record<string, unknown>[] = [];
        if (sectionType === 'logo' && Array.isArray(data.logos)) rowsToInsert = data.logos as Record<string, unknown>[];
        else if (sectionType === 'color_palette' && Array.isArray(data.colors)) rowsToInsert = data.colors as Record<string, unknown>[];
        else if (sectionType === 'typography' && Array.isArray(data.fonts)) rowsToInsert = data.fonts as Record<string, unknown>[];
        else if (sectionType === 'resources' && Array.isArray(data.resources)) rowsToInsert = data.resources as Record<string, unknown>[];

        if (rowsToInsert.length > 0) {
          const { error } = await supabase.from(tableName).insert(
            rowsToInsert.map((row, i) => ({
              ...row,
              brand_id: projectId,
              sort_order: i,
              id: row.id ?? undefined // preserve ID if exists
            }))
          );
          if (error) throw error;
        }
      } else {
        // Single-row tables — convert camelCase from UI to snake_case for Supabase
        const snakeData = camelToSnake(data);
        delete snakeData.brand_id; // remove if somehow present in data to avoid conflicts

        const { error } = await supabase
          .from(tableName)
          .upsert({
            brand_id: projectId,
            ...snakeData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'brand_id' });

        if (error) throw error;
      }

      await get().addActivityEvent(projectId, {
        eventType: "section_updated",
        actorType: "studio",
        actorName: "HeritageStone Admin",
        sectionKey: sectionType,
        description: `Updated the ${sectionType} section.`
      });

      set({ saveIndicator: "saved" });
      setTimeout(() => set({ saveIndicator: "idle" }), 2000);

      // Invalidate portal cache
      const project = get().projects.find(p => p.id === projectId);
      if (project?.clientSlug) {
        invalidatePortalCache(project.clientSlug);
      }
    } catch (err) {
      console.error(`Error updating project section ${sectionType}:`, err);
      set({ saveIndicator: "error" });
    }
  }
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard State
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardState {
  stats: DashboardStats;
  attentionItems: AttentionItem[];
  recentActivity: ActivityEvent[];

  setStats: (stats: DashboardStats) => void;
  setAttentionItems: (items: AttentionItem[]) => void;
  setRecentActivity: (activity: ActivityEvent[]) => void;
  fetchDashboardStats: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    activeProjects: 0,
    pendingApprovals: 0,
    openRequests: 0,
    unreadMessages: 0,
  },
  attentionItems: [],
  recentActivity: [],

  setStats: (stats) => set({ stats }),
  setAttentionItems: (items) => set({ attentionItems: items }),
  setRecentActivity: (activity) => set({ recentActivity: activity }),

  fetchDashboardStats: async () => {
    try {
      const { data: projects } = await supabase.from("brands").select("id, status, is_published, approval_states");
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .is("read_at", null)
        .eq("sender_type", "client");

      const stats: DashboardStats = {
        activeProjects: projects?.filter(p => !p.is_published && p.status !== 'archived').length || 0,
        pendingApprovals: projects?.reduce((acc, p) => {
          const approvals = (p.approval_states as any[]) || [];
          return acc + approvals.filter(a => a.status === 'pending').length;
        }, 0) || 0,
        openRequests: 0, // Placeholder as there is no requests table yet
        unreadMessages: unreadCount || 0,
      };

      // Simple heuristic for attention items
      const attentionItems: AttentionItem[] = [];
      if ((unreadCount || 0) > 0) {
        attentionItems.push({
          id: 'unread-msg',
          title: 'Unread Client Messages',
          subtitle: `You have ${unreadCount} new messages from clients`,
          type: 'message',
          projectId: '',
          createdAt: new Date().toISOString()
        });
      }
      
      projects?.forEach(p => {
        const approvals = (p.approval_states as any[]) || [];
        const pending = approvals.filter(a => a.status === 'pending');
        if (pending.length > 0) {
          attentionItems.push({
            id: `pending-${p.id}`,
            title: `Approve: ${p.brand_name}`,
            subtitle: `${pending.length} sections waiting for review`,
            type: 'approval',
            projectId: p.id,
            createdAt: new Date().toISOString()
          });
        }
      });

      set({ stats, attentionItems: attentionItems.slice(0, 5) });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  },

  fetchRecentActivity: async () => {
    try {
      const { data, error } = await supabase
        .from("activity_events")
        .select("*, brands(brand_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const events: ActivityEvent[] = (data || []).map((e: any) => ({
        id: e.id,
        projectId: e.brand_id,
        projectName: e.brands?.brand_name || "Unknown Project",
        eventType: e.event_type,
        actorType: e.actor_type,
        actorName: e.actor_name,
        description: e.description,
        sectionKey: e.section_key,
        metadata: e.metadata,
        createdAt: e.created_at
      }));

      set({ recentActivity: events });
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  },
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Auth State (with persistence)
// ═══════════════════════════════════════════════════════════════════════════════

interface AuthState {
  user: StudioUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: StudioUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { firstName?: string; lastName?: string; avatarUrl?: string; role?: StudioUser["role"] }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudioUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        if (data.user) {
          const studioUser: StudioUser = {
            id: data.user.id,
            email: data.user.email!,
            firstName: data.user.user_metadata.firstName || "",
            lastName: data.user.user_metadata.lastName || "",
            avatarUrl: data.user.user_metadata.avatarUrl || null,
            role: (data.user.user_metadata.role as StudioUser["role"]) || "admin",
            createdAt: data.user.created_at,
            lastLoginAt: new Date().toISOString(),
            isActive: true,
          };
          set({ user: studioUser, isAuthenticated: true, isLoading: false });
        }
      },

      signUp: async (email, password, metadata) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });

        if (error) {
          set({ isLoading: false });
          throw error;
        }

        if (data.user) {
          const studioUser: StudioUser = {
            id: data.user.id,
            email: data.user.email!,
            firstName: metadata.firstName || "",
            lastName: metadata.lastName || "",
            avatarUrl: metadata.avatarUrl || null,
            role: metadata.role || "admin",
            createdAt: data.user.created_at,
            lastLoginAt: new Date().toISOString(),
            isActive: true,
          };
          set({ user: studioUser, isAuthenticated: true, isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
        useProjectsStore.getState().setProjects([]);
      },

      updateProfile: async (updates) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.updateUser({
            data: {
              firstName: updates.firstName,
              lastName: updates.lastName,
              avatarUrl: updates.avatarUrl,
            },
          });

          if (error) throw error;

          if (data.user) {
            const studioUser: StudioUser = {
              id: data.user.id,
              email: data.user.email!,
              firstName: data.user.user_metadata.firstName || "",
              lastName: data.user.user_metadata.lastName || "",
              avatarUrl: data.user.user_metadata.avatarUrl || null,
              role: (data.user.user_metadata.role as StudioUser["role"]) || "admin",
              createdAt: data.user.created_at,
              lastLoginAt: new Date().toISOString(),
              isActive: true,
            };
            set({ user: studioUser, isLoading: false });
            useUIStore.getState().showToast("Profile updated successfully", "success");
          }
        } catch (err) {
          console.error("Error updating profile:", err);
          set({ isLoading: false });
          useUIStore.getState().showToast("Failed to update profile", "error");
        }
      },
    }),
    {
      name: "heritagestone-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// Document Editor State
// ═══════════════════════════════════════════════════════════════════════════════

interface DocumentEditorState {
  activeChapter: ChapterKey;
  editMode: "view" | "edit";
  unsavedChanges: boolean;
  activeSection: SupabaseSectionType | null;

  setActiveChapter: (chapter: ChapterKey) => void;
  setEditMode: (mode: "view" | "edit") => void;
  setUnsavedChanges: (unsaved: boolean) => void;
  setActiveSection: (section: SupabaseSectionType | null) => void;
}

export const useDocumentEditorStore = create<DocumentEditorState>((set) => ({
  activeChapter: "foundation",
  editMode: "view",
  unsavedChanges: false,
  activeSection: null,

  setActiveChapter: (chapter) => set({ activeChapter: chapter }),
  setEditMode: (mode) => set({ editMode: mode }),
  setUnsavedChanges: (unsaved) => set({ unsavedChanges: unsaved }),
  setActiveSection: (section) => set({ activeSection: section }),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Portal State
// ═══════════════════════════════════════════════════════════════════════════════

interface PortalState {
  previewMode: boolean;
  previewPermissionLevel: PermissionLevel;

  setPreviewMode: (mode: boolean) => void;
  setPreviewPermissionLevel: (level: PermissionLevel) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  previewMode: false,
  previewPermissionLevel: "full",

  setPreviewMode: (mode) => set({ previewMode: mode }),
  setPreviewPermissionLevel: (level) => set({ previewPermissionLevel: level }),
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Chat State
// ═══════════════════════════════════════════════════════════════════════════════

interface ChatState {
  activeThread: string | null;
  replyText: string;

  setActiveThread: (threadId: string | null) => void;
  setReplyText: (text: string) => void;
  sendMessage: (content: string) => void;
  markThreadAsRead: (threadId: string) => void;
  resolveThread: (threadId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeThread: null,
  replyText: "",

  setActiveThread: (threadId) => set({ activeThread: threadId }),
  setReplyText: (text) => set({ replyText: text }),

  sendMessage: (_content) => {
    set({ replyText: "" });
  },

  markThreadAsRead: (threadId) => {
    void threadId;
  },

  resolveThread: (threadId) => {
    void threadId;
  },
}));
