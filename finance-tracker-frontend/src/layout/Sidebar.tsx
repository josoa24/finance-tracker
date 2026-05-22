import { type NavItem } from '../config/navigationItems'
import UserProfile from './UserProfile'
import './sidebar.css'

interface Props {
  navItems: NavItem[]
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activePage: string
  setActivePage: (key: string) => void
  accountId?: number | null
}

export default function Sidebar({ navItems, sidebarOpen, setSidebarOpen, activePage, setActivePage, accountId }: Props) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <i className="bx bxs-bank" />
          {sidebarOpen && <span>FinBoard</span>}
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className={`bx ${sidebarOpen ? 'bx-chevron-left' : 'bx-chevron-right'}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const href = item.key === 'analytics' && accountId ? `/accounts/${accountId}` : item.href
          return (
            <a
              key={item.key}
              href={href}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              <i className={`bx ${item.icon}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <a href="/transactions/new" className="nav-item">
          <i className="bx bx-transfer" />
          {sidebarOpen && <span>Faire transaction</span>}
        </a>
        <a href="/dashboard/create" className="nav-item new-account-link">
          <i className="bx bx-plus-circle" />
          {sidebarOpen && <span>Nouveau compte</span>}
        </a>
        <a href="/settings" className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
          <i className="bx bx-cog" />
          {sidebarOpen && <span>Paramètres</span>}
        </a>
      </div>

      <UserProfile sidebarOpen={sidebarOpen} />
    </aside>
  )
}
