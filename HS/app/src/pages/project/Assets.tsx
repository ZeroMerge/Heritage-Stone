import { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Upload,
  FileText,
  Image,
  Palette,
  Type,
  MoreVertical,
  Download,
  Eye,
  Search,
  Filter,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { useProjectsStore, useUIStore } from "@/store";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import { formatBytes, cn } from "@/lib/utils";
import { uploadFile, buildUrl } from "@/lib/cloudinary";
import type { Project, Asset, AssetCategory } from "@/types";

interface OverviewContext {
  project: Project;
}

const categories: { id: AssetCategory | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: FileText },
  { id: "logo", label: "Logos", icon: Image },
  { id: "color", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "photography", label: "Photography", icon: Image },
  { id: "document", label: "Documents", icon: FileText },
];

const fileIcons: Record<string, React.ElementType> = {
  "image/svg+xml": Image,
  "image/png": Image,
  "image/jpeg": Image,
  "application/pdf": FileText,
  default: FileText,
};

export function Assets() {
  const { project } = useOutletContext<OverviewContext>();
  const { assets, addAsset, deleteAsset } = useProjectsStore();
  const { showConfirm } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<AssetCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isImage = (type: string) => type.startsWith("image/");

  // Build Cloudinary thumbnail URL from fileUrl
  const thumbUrl = (url: string) => {
    // Insert c_thumb,w_240,h_160,q_auto,f_auto transformation
    return url.replace("/upload/", "/upload/c_thumb,w_240,h_160,q_auto,f_auto/");
  };

  const handleUploadAsset = async (data: Partial<Asset>, file: File) => {
    try {
      const publicId = await uploadFile(file);
      const fileUrl = buildUrl(publicId);

      const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        projectId: project.id,
        name: data.name!,
        fileUrl,
        fileType: file.type,
        fileSizeBytes: file.size,
        category: data.category as AssetCategory,
        visibleToClient: data.visibleToClient ?? true,
        uploadedBy: "Current User",
        createdAt: new Date().toISOString(),
      };

      addAsset(project.id, newAsset);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Upload failed", error);
      // Fallback or Toast here
    }
  };

  const projectAssets = assets[project.id] || [];

  const filteredAssets = projectAssets.filter((asset) => {
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Assets
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage brand assets and resources
          </p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 self-start"
        >
          <Upload className="w-4 h-4" />
          Upload Asset
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-3"
      >
        {/* Category pills — compact, horizontal scroll on mobile */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-[11px] font-medium whitespace-nowrap flex-shrink-0 transition-colors rounded-full",
                  activeCategory === cat.id
                    ? "bg-[var(--hs-primary)] text-white dark:text-[#0f0f0f]"
                    : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                )}
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search — full width on mobile */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className={cn(
                "w-full pl-8 pr-4 py-1.5 rounded-full bg-[var(--surface-default)] border border-[var(--border-default)]",
                "text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:border-[var(--hs-accent)]",
                "transition-colors"
              )}
            />
          </div>
          <button className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors border border-[var(--border-default)]">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Assets Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filteredAssets.map((asset, index) => {
              const FileIcon = fileIcons[asset.fileType] || fileIcons.default;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-[var(--surface-default)] border border-[var(--border-subtle)] rounded-xl group hover:border-[var(--hs-accent)] transition-colors"
                >
                  <div className="aspect-video bg-[var(--surface-subtle)] rounded-t-xl overflow-hidden flex items-center justify-center">
                    {isImage(asset.fileType) ? (
                      <img
                        src={thumbUrl(asset.fileUrl)}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <FileIcon className="w-7 h-7 sm:w-10 sm:h-10 text-[var(--text-tertiary)]" />
                    )}
                  </div>

                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-[var(--text-primary)] truncate text-xs sm:text-sm">
                      {asset.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 sm:mt-1">
                      {formatBytes(asset.fileSizeBytes)}
                    </p>

                    <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--border-subtle)]">
                      <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)] capitalize">
                        {asset.category}
                      </span>
                      <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                          onClick={() => isImage(asset.fileType) ? setPreviewUrl(asset.fileUrl) : window.open(asset.fileUrl, '_blank')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            showConfirm({
                              title: "Delete Asset",
                              message: `Are you sure you want to delete "${asset.name}"? This will permanently remove it from the brand library.`,
                              type: "danger",
                              confirmLabel: "Delete",
                              onConfirm: () => deleteAsset(project.id, asset.id),
                            });
                          }}
                          className="p-1 sm:p-1.5 text-red-600 hover:bg-red-900/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Upload}
            title="No assets yet"
            description="Upload brand assets to share with your team and clients"
            action={
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="btn btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </button>
            }
          />
        )}
      </motion.div>

      {/* Modals */}
      {isUploadModalOpen && (
        <UploadAssetModal
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleUploadAsset}
        />
      )}

      {/* Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function UploadAssetModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Partial<Asset>, file: File) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("document");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !name) return;
    setIsUploading(true);
    try {
      await onSubmit(
        {
          name,
          category,
          visibleToClient: true,
        },
        file
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 bg-[var(--surface-default)] z-10">
          <h3 className="font-semibold text-[var(--text-primary)]">
            Upload Asset
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              File
            </label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  if (!name) setName(f.name.split(".")[0]);
                }
              }}
              className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-[var(--surface-subtle)] file:text-[var(--text-primary)] hover:file:bg-[var(--surface-hover)]"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Primary Logo"
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              disabled={isUploading}
            >
              {categories.filter(c => c.id !== "all").map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end gap-2 sticky bottom-0 bg-[var(--surface-default)] z-10">
          <button onClick={onClose} className="btn btn-secondary" disabled={isUploading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !name || isUploading}
            className="btn btn-primary flex items-center gap-2"
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Upload
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
