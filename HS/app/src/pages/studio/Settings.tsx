import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: { 
  title: string
  description?: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-6"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[var(--hs-accent)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
          {description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────

function FormField({ 
  label, 
  children,
  hint
}: { 
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="mb-5">
      <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{hint}</p>
      )}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ 
  checked, 
  onChange
}: { 
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-[var(--hs-accent)]' : 'bg-[var(--border-strong)]'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

const PRESET_AVATARS = [
  { id: 'av-1', color: 'bg-emerald-500', icon: 'HS' },
  { id: 'av-2', color: 'bg-blue-500', icon: 'RS' },
  { id: 'av-3', color: 'bg-purple-500', icon: 'MN' },
  { id: 'av-4', color: 'bg-orange-500', icon: 'ST' },
  { id: 'av-5', color: 'bg-rose-500', icon: 'AD' },
  { id: 'av-6', color: 'bg-indigo-500', icon: 'BK' },
]

export function Settings() {
  const { user, updateProfile } = useAuthStore()
  const { showToast } = useUIStore()
  const [selectedAvatar, setSelectedAvatar] = useState('av-1')
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [studioName, setStudioName] = useState('Heritage Stone')
  const [portalDomain, setPortalDomain] = useState('ravennorthstudio.com')
  const [defaultTemplate, setDefaultTemplate] = useState('codex')
  const [notifications, setNotifications] = useState({
    email_approvals: true,
    email_messages: true,
    email_deadlines: false,
    email_activity: true,
  })
  const [settingsId, setSettingsId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('studio_settings').select('*').maybeSingle()
      if (data) {
        setSettingsId(data.id)
        setStudioName(data.studio_name || 'Heritage Stone')
        setPortalDomain(data.primary_domain || '')
        setDefaultTemplate(data.default_template_id || 'codex')
      }
    };
    
    const fetchProfile = async () => {
      if (user) {
        setFirstName(user.firstName || '')
        setLastName(user.lastName || '')
        setSelectedAvatar(user.avatarUrl || 'av-1')
        // In a real app we'd fetch notification settings from profiles table here
      }
    };

    fetchSettings()
    fetchProfile()
  }, [user])

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        avatarUrl: selectedAvatar, // We're using the ID as the URL for now as per minimal preset system
      })
      showToast("Profile updated successfully", "success")
    } catch (error) {
      console.error(error)
      showToast("Failed to update profile", "error")
    }
  }

  const handleSaveWorkspace = async () => {
    try {
      const { error } = await supabase
        .from('studio_settings')
        .upsert({ 
          id: settingsId || undefined, // undefined will trigger generate_v4
          studio_name: studioName, 
          primary_domain: portalDomain,
          default_template_id: defaultTemplate,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      showToast("Workspace preferences saved", "success")
    } catch (error) {
      console.error(error)
      showToast("Failed to save workspace settings", "error")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="heading-xl text-[var(--text-primary)] mb-2">
          Settings
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your account and workspace preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SectionCard
          title="Profile"
          description="Manage your personal information and avatar (selection system to reduce storage)"
          icon={User}
        >
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-[#202c33] transition-all duration-300",
                  PRESET_AVATARS.find(a => a.id === selectedAvatar)?.color || 'bg-[var(--hs-accent)]'
                )}>
                  <span className="text-white text-3xl font-bold tracking-tight">
                    {PRESET_AVATARS.find(a => a.id === selectedAvatar)?.icon}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Choose your avatar</p>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-sm",
                        avatar.color,
                        selectedAvatar === avatar.id ? "ring-2 ring-offset-2 ring-[var(--hs-accent)] scale-110" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      <span className="text-white text-[10px] font-bold">{avatar.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name">
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
              </FormField>
              <FormField label="Last Name">
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="btn btn-primary" onClick={handleSaveProfile}>
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </SectionCard>

        {/* Notifications Section */}
        <SectionCard
          title="Notifications"
          description="Control how and when you receive updates"
          icon={Bell}
        >
          <div className="space-y-4">
            {[
              { id: 'email_approvals', label: 'Section approvals', description: 'When a client approves or requests revisions' },
              { id: 'email_messages', label: 'New messages', description: 'When someone sends a chat message' },
              { id: 'email_deadlines', label: 'Deadline reminders', description: 'Upcoming go-live dates and milestones' },
              { id: 'email_activity', label: 'Project activity', description: 'Updates on assets, members, and changes' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-0">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                </div>
                <Toggle 
                  checked={notifications[item.id as keyof typeof notifications]} 
                  onChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))} 
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Workspace Section */}
        <SectionCard
          title="Workspace"
          description="Configure your studio workspace settings"
          icon={Palette}
        >
          <FormField label="Studio Name" hint="This appears in client communications">
            <input 
              type="text" 
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="input"
            />
          </FormField>

          <FormField label="Default Portal Domain">
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-[var(--surface-subtle)] border border-r-0 border-[var(--border-default)] rounded-l-[var(--radius-md)] text-sm text-[var(--text-secondary)]">
                https://
              </span>
              <input 
                type="text" 
                value={portalDomain}
                onChange={(e) => setPortalDomain(e.target.value)}
                className="input rounded-l-none flex-1"
              />
            </div>
          </FormField>

          <FormField label="Default Template">
            <select 
              className="input"
              value={defaultTemplate}
              onChange={(e) => setDefaultTemplate(e.target.value)}
            >
              <option value="codex">Codex</option>
              <option value="folio">Folio</option>
            </select>
          </FormField>

          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={handleSaveWorkspace}>
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </SectionCard>

        {/* Security Section */}
        <SectionCard
          title="Security"
          description="Manage your password and security settings"
          icon={Shield}
        >
          <FormField label="Current Password">
            <input 
              type="password" 
              placeholder="Enter your current password"
              className="input"
            />
          </FormField>

          <FormField label="New Password">
            <input 
              type="password" 
              placeholder="Enter a new password"
              className="input"
            />
          </FormField>

          <FormField label="Confirm New Password">
            <input 
              type="password" 
              placeholder="Confirm your new password"
              className="input"
            />
          </FormField>

          <div className="flex justify-end">
            <button className="btn btn-primary">
              <Shield className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
