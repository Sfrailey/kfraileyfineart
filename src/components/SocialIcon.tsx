/** Line icon for a social platform; renders nothing for platforms without one. */
export function SocialIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  if (platform === 'Instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return null
}
