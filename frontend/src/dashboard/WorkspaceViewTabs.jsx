/** Horizontal workspace tabs — SAFETY / SECURITY / SYSTEMS / STATUS (Harland + Aviora). */

function IconSafety() {
  return (
    <svg className="client-workspace-viewtab-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5L12 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 12.5 11 14.5 15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSecurity() {
  return (
    <svg className="client-workspace-viewtab-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 2.5 5 5.5v5.5c0 4.6 2.9 8 7 9.5 4.1-1.5 7-4.9 7-9.5V5.5L12 2.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconSystems() {
  return (
    <svg className="client-workspace-viewtab-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconStatus() {
  return (
    <svg className="client-workspace-viewtab-ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

const TABS = [
  { id: 'safety', label: 'Safety', Icon: IconSafety },
  { id: 'security', label: 'Security', Icon: IconSecurity },
  { id: 'systems', label: 'Systems', Icon: IconSystems },
  { id: 'status', label: 'Status', Icon: IconStatus },
]

/**
 * @param {{
 *   value: 'safety' | 'security' | 'systems' | 'status'
 *   onChange: (id: 'safety' | 'security' | 'systems' | 'status') => void
 *   className?: string
 * }} props
 */
export default function WorkspaceViewTabs({ value, onChange, className = '' }) {
  return (
    <nav
      className={`client-workspace-viewtabs${className ? ` ${className}` : ''}`}
      role="tablist"
      aria-label="Workspace views"
    >
      {TABS.map((tab) => {
        const TabIcon = tab.Icon
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            className={`client-workspace-viewtab client-workspace-viewtab--${tab.id}${value === tab.id ? ' is-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <TabIcon />
            <span className="client-workspace-viewtab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
