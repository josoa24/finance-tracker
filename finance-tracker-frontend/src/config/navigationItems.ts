export type NavItem = { key: string; icon: string; label: string; href: string }

export const navItems: NavItem[] = [
  { key: 'dashboard', icon: 'bxs-dashboard', label: 'Tableau de bord', href: '/dashboard' },
  { key: 'accounts', icon: 'bx-wallet', label: 'Mes comptes', href: '/dashboard/accounts' },
  { key: 'transfer', icon: 'bx-transfer', label: 'Transfert', href: '/dashboard/transfer' },
  { key: 'history', icon: 'bx-history', label: 'Historique', href: '/dashboard/history' },
  { key: 'analytics', icon: 'bx-bar-chart-alt-2', label: 'Analytiques', href: '/dashboard/analytics' },
]
