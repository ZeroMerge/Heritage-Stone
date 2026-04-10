import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Palette,
} from "lucide-react";
import { useProjectsStore, useUIStore } from "@/store";
import { createSubBrand, calculateSubBrandHealthScore } from "@/lib/inheritance";
import { HealthScoreRing } from "@/components/ui-custom/HealthScoreRing";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { Project, SubBrand } from "@/types";
import { cn, getContrastText } from "@/lib/utils";

interface OverviewContext {
  project: Project;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Campaigns() {
  const { project } = useOutletContext<OverviewContext>();
  const { updateProject } = useProjectsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubBrand, setEditingSubBrand] = useState<SubBrand | null>(null);

  const { showConfirm } = useUIStore();

  const campaigns = project.subBrands || [];

  const handleAddCampaign = (data: {
    name: string;
    description: string;
    brandColour: string;
    relationship: SubBrand["relationship"];
  }) => {
    const newCampaign = createSubBrand(
      project.id,
      data.name,
      data.brandColour,
      data.description,
      data.relationship
    );

    updateProject(project.id, {
      subBrands: [...campaigns, newCampaign],
    });

    setShowAddModal(false);
  };

  const handleDeleteCampaign = (id: string) => {
    showConfirm({
      title: "Delete Campaign",
      message: "Are you sure you want to delete this campaign? This action cannot be undone and will remove all inherited segments.",
      type: "danger",
      confirmLabel: "Delete Campaign",
      onConfirm: () => {
        updateProject(project.id, {
          subBrands: campaigns.filter((sb) => sb.id !== id),
        });
      },
    });
  };

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
            Campaigns
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage campaigns and segments that inherit from {project.clientName}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add Campaign
        </button>
      </motion.div>

      {/* Parent Brand Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-6"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ backgroundColor: project.brandColour }}
          >
            <span
              className="text-xl font-bold"
              style={{ color: getContrastText(project.brandColour) }}
            >
              {getInitials(project.clientName)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[var(--text-secondary)]">Parent Brand</p>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {project.clientName}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {project.industry}
            </p>
          </div>
          <HealthScoreRing score={project.healthScore} size={64} />
        </div>
      </motion.div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="bg-[var(--surface-default)] border border-[var(--border-subtle)] overflow-hidden group"
            >
              <div
                className="h-24 relative"
                style={{ backgroundColor: campaign.brandColour }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-3 right-3">
                  <HealthScoreRing
                    score={calculateSubBrandHealthScore(campaign)}
                    size={48}
                    strokeWidth={3}
                  />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {campaign.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setEditingSubBrand(campaign)}
                    className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Palette}
          title="No campaigns yet"
          description="Create campaigns that inherit from the parent brand"
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Campaign
            </button>
          }
        />
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddCampaignModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCampaign}
          />
        )}
        {editingSubBrand && (
          <EditCampaignModal
            subBrand={editingSubBrand}
            parentBrand={project}
            onClose={() => setEditingSubBrand(null)}
            onSubmit={(updatedCampaign) => {
              updateProject(project.id, {
                subBrands: campaigns.map((sb) =>
                  sb.id === updatedCampaign.id ? updatedCampaign : sb
                ),
              });
              setEditingSubBrand(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddCampaignModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    brandColour: string;
    relationship: SubBrand["relationship"];
  }) => void;
}) {
  const [data, setData] = useState({
    name: "",
    relationship: "subsidiary" as SubBrand["relationship"], // Default
    description: "",
    brandColour: "#0F0F0F",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] w-full max-w-md"
      >
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">
            Add Campaign
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="e.g., Summer Launch 2024"
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Relationship to Parent
            </label>
            <select
              value={data.relationship}
              onChange={(e) =>
                setData({
                  ...data,
                  relationship: e.target.value as SubBrand["relationship"],
                })
              }
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
            >
              <option value="subsidiary">Subsidiary / Division</option>
              <option value="product_line">Product Line</option>
              <option value="regional_variant">Regional Variant</option>
              <option value="licensed_partner">Licensed Partner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Brief description of this campaign or segment..."
              rows={3}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.brandColour}
                onChange={(e) => setData({ ...data, brandColour: e.target.value })}
                className="w-12 h-10 p-0 border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.brandColour}
                onChange={(e) => setData({ ...data, brandColour: e.target.value })}
                className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(data)}
            disabled={!data.name}
            className="btn btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { updateSubBrandField, getInheritedValue, isFieldOverridden } from "@/lib/inheritance";

function EditCampaignModal({
  subBrand,
  parentBrand,
  onClose,
  onSubmit,
}: {
  subBrand: SubBrand;
  parentBrand: Project;
  onClose: () => void;
  onSubmit: (data: SubBrand) => void;
}) {
  const [data, setData] = useState<SubBrand>(subBrand);

  const handleFieldChange = (field: string, value: any, inherit: boolean) => {
    setData((prev) => updateSubBrandField(prev, field, value, inherit));
  };

  const isDescOverridden = isFieldOverridden(data, "description");
  const isColorOverridden = isFieldOverridden(data, "brandColour");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
            Edit {subBrand.name} Campaign
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Relationship - Cannot inherit */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Relationship to Parent
            </label>
            <select
              value={data.relationship}
              onChange={(e) =>
                setData({
                  ...data,
                  relationship: e.target.value as SubBrand["relationship"],
                })
              }
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
            >
              <option value="subsidiary">Subsidiary / Division</option>
              <option value="product_line">Product Line</option>
              <option value="regional_variant">Regional Variant</option>
              <option value="licensed_partner">Licensed Partner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Name (Local only)
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
            />
          </div>

          {/* Description */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Description
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!isDescOverridden}
                  onChange={(e) =>
                    handleFieldChange(
                      "description",
                      parentBrand.description,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                Inherit from Parent
              </label>
            </div>
            <textarea
              value={
                isDescOverridden
                  ? getInheritedValue<string>(parentBrand, data, "description")
                  : parentBrand.description
              }
              onChange={(e) =>
                handleFieldChange("description", e.target.value, false)
              }
              disabled={!isDescOverridden}
              rows={3}
              className={cn(
                "w-full px-4 py-2 border text-[var(--text-primary)] focus:outline-none resize-none",
                !isDescOverridden
                  ? "bg-[var(--surface-default)] border-dashed border-[var(--border-default)] opacity-70 cursor-not-allowed"
                  : "bg-[var(--bg-primary)] border-[var(--border-default)] focus:border-[var(--hs-accent)]"
              )}
            />
          </div>

          {/* Brand Color */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Brand Color
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!isColorOverridden}
                  onChange={(e) =>
                    handleFieldChange(
                      "brandColour",
                      parentBrand.brandColour,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                Inherit from Parent
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  isColorOverridden
                    ? getInheritedValue<string>(parentBrand, data, "brandColour") || "#0F0F0F"
                    : parentBrand.brandColour
                }
                onChange={(e) =>
                  handleFieldChange("brandColour", e.target.value, false)
                }
                disabled={!isColorOverridden}
                className={cn(
                  "w-12 h-10 p-0 border-0 cursor-pointer",
                  !isColorOverridden && "opacity-70 cursor-not-allowed"
                )}
              />
              <input
                type="text"
                value={
                  isColorOverridden
                    ? getInheritedValue<string>(parentBrand, data, "brandColour") || "#0F0F0F"
                    : parentBrand.brandColour
                }
                onChange={(e) =>
                  handleFieldChange("brandColour", e.target.value, false)
                }
                disabled={!isColorOverridden}
                className={cn(
                  "flex-1 px-4 py-2 border text-[var(--text-primary)] focus:outline-none",
                  !isColorOverridden
                    ? "bg-[var(--surface-default)] border-dashed border-[var(--border-default)] opacity-70 cursor-not-allowed"
                    : "bg-[var(--bg-primary)] border-[var(--border-default)] focus:border-[var(--hs-accent)]"
                )}
              />
            </div>
          </div>

          {/* Health Score Slider */}
          <div className="p-4 border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Campaign Health Score
              </label>
              <span className={cn(
                "text-sm font-bold px-2 py-0.5 rounded",
                data.healthScore > 80 ? "text-emerald-500 bg-emerald-500/10" :
                data.healthScore > 50 ? "text-amber-500 bg-amber-500/10" :
                "text-rose-500 bg-rose-500/10"
              )}>
                {data.healthScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={data.healthScore}
              onChange={(e) => setData({ ...data, healthScore: parseInt(e.target.value) })}
              className="w-full h-2 bg-[var(--border-default)] rounded-lg appearance-none cursor-pointer accent-[var(--hs-accent)]"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Critical</span>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">Healthy</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end gap-2 sticky bottom-0 bg-[var(--surface-default)] z-10">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(data)}
            disabled={!data.name}
            className="btn btn-primary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
