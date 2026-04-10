import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image as ImageIcon, FileText, Film, Music, Check, Loader2 } from 'lucide-react';
import { useProjectsStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Asset, AssetCategory } from '@/types';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  projectId: string;
  categoryFilter?: AssetCategory;
  title?: string;
}

export function AssetPickerModal({
  isOpen,
  onClose,
  onSelect,
  projectId,
  categoryFilter,
  title = "Select Asset"
}: AssetPickerModalProps) {
  const { assets, fetchAssets } = useProjectsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>(categoryFilter || 'all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      const load = async () => {
        setIsLoading(true);
        await fetchAssets(projectId);
        setIsLoading(false);
      };
      load();
    }
  }, [isOpen, projectId, fetchAssets]);

  const projectAssets = assets[projectId] || [];
  
  const filteredAssets = projectAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const CATEGORIES: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Assets' },
    { id: 'brand_logos', label: 'Logos' },
    { id: 'photography', label: 'Photography' },
    { id: 'typography', label: 'Typography' },
    { id: 'icons', label: 'Icons' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'other', label: 'Other' },
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-[var(--surface-default)] border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-primary)]">{title}</h2>
              <button 
                onClick={onClose}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-4 border-b border-[var(--border-subtle)] space-y-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium border transition-all",
                      activeCategory === cat.id 
                        ? "bg-[var(--hs-primary)] border-[var(--hs-primary)] text-white" 
                        : "bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search project assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--hs-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[var(--bg-secondary)]">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Loading assets...</p>
                </div>
              ) : filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAssets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => onSelect(asset)}
                      className="group relative aspect-square bg-[var(--surface-default)] border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--hs-primary)] transition-all flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center p-2">
                        {asset.fileType.startsWith('image/') ? (
                          <img 
                            src={asset.fileUrl} 
                            alt={asset.name} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-[var(--text-tertiary)]">
                            {getFileIcon(asset.fileType)}
                            <span className="text-[10px] uppercase mt-2">{asset.fileType.split('/')[1] || 'file'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)] group-hover:bg-[var(--hs-primary)] group-hover:text-white transition-colors">
                        <p className="text-[11px] font-medium truncate text-left">{asset.name}</p>
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[var(--hs-primary)] text-white p-1 rounded-full shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No assets found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)] flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
