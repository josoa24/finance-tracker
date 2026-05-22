import { type NavItem } from '../config/navigationItems'
import { useState } from 'react'
import UserProfile from './UserProfile'
import './sidebar.css'

interface Props {
  navItems: NavItem[]
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activePage: string
  setActivePage: (key: string) => void
}

export default function Sidebar({ navItems, sidebarOpen, setSidebarOpen, activePage, setActivePage }: Props) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
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
          const href = item.href
          const itemNode = (
            <a
              key={item.key}
              href={href}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={(e) => {
                // if this is the accounts item, toggle submenu instead of navigating
                if (item.key === 'accounts') {
                  e.preventDefault()
                  setOpenGroup((prev) => (prev === 'accounts' ? null : 'accounts'))
                  setActivePage('accounts')
                  return
                }
                setActivePage(item.key)
              }}
            >
              <i className={`bx ${item.icon}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          )

          // After the analytics item, inject the quick actions into the main nav
          if (item.key === 'analytics') {
            return (
              <div key="analytics-group">
                {itemNode}
                <a href="/transactions/new" className="nav-item quick-action" onClick={() => setActivePage('transactions')}>
                  <i className="bx bx-transfer" />
                  {sidebarOpen && <span>Faire transaction</span>}
                </a>
                {/* Removed duplicate 'Nouveau compte' quick-action (kept in Mes comptes submenu) */}
                <a href="/settings" className={`nav-item quick-action ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
                  <i className="bx bx-cog" />
                  {sidebarOpen && <span>Paramètres</span>}
                </a>
              </div>
            )
          }
          
          // If this is the accounts item, render a submenu when open
          if (item.key === 'accounts') {
            return (
              <div key="accounts-group" className={`nav-group ${openGroup === 'accounts' ? 'open' : ''}`}>
                {itemNode}
                <div className="nav-submenu" style={{ display: openGroup === 'accounts' && sidebarOpen ? 'block' : 'none' }}>
                  <a href="/dashboard/accounts" className="submenu-item" onClick={() => setActivePage('accounts')}>
                    <i className="bx bx-list-ul" />
                    {sidebarOpen && <span>Liste</span>}
                  </a>
                  <a href="/dashboard/create" className="submenu-item" onClick={() => setActivePage('accounts')}>
                    <i className="bx bx-plus-circle" />
                    {sidebarOpen && <span>Nouveau compte</span>}
                  </a>
                </div>
              </div>
            )
          }

          return itemNode
        })}
      </nav>

      <UserProfile sidebarOpen={sidebarOpen} />
    </aside>
  )
}
