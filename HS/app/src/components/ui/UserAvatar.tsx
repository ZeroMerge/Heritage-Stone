const DICEBEAR_STYLES = new Set(['lorelei','fun-emoji','adventurer','micah','personas','pixel-art']);

function buildDiceBearUrl(seed: string, style = 'lorelei') {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear&radius=50`;
}

interface UserAvatarProps {
  seed?: string;        // email or user id — deterministic seed
  initials?: string;   // fallback letters
  avatarUrl?: string | null;  // user-uploaded photo (takes priority)
  size?: number;       // pixel size (default 32)
  className?: string;
}

export function UserAvatar({
  seed,
  initials,
  avatarUrl,
  size = 32,
  className = "",
}: UserAvatarProps) {
  // Resolve what to display:
  // 1. avatarUrl is a full http URL (user uploaded) → use as-is
  // 2. avatarUrl is a dicebear style ID → generate URL with that style
  // 3. No avatarUrl → use default lorelei style
  let src: string | null = null;
  if (seed) {
    if (avatarUrl && !DICEBEAR_STYLES.has(avatarUrl) && avatarUrl.startsWith('http')) {
      src = avatarUrl; // real uploaded photo
    } else {
      const style = (avatarUrl && DICEBEAR_STYLES.has(avatarUrl)) ? avatarUrl : 'lorelei';
      src = buildDiceBearUrl(seed, style);
    }
  }

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface-subtle)",
    fontSize: size * 0.38,
    fontWeight: 600,
    color: "var(--text-secondary)",
  };

  if (src) {
    return (
      <div style={style} className={className}>
        <img
          src={src}
          alt={initials || "avatar"}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // swap to fallback div on load error
            const el = e.currentTarget;
            const parent = el.parentElement!;
            parent.removeChild(el);
            parent.textContent = initials || "?";
          }}
        />
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      {initials || "?"}
    </div>
  );
}
