import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import AccountCard from '../components/AccountCard'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import './AccountsDashboardPage.css'
import type { Account } from '../types'
import { formatCurrency } from '../utils'

export default function AccountsDashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')

  const totalBalance = useMemo(
    () => accounts.reduce((total, account) => total + account.balance, 0),
    [accounts],
  )

  const hasMixedCurrencies = useMemo(() => {
    const currencyIds = new Set(accounts.map((account) => account.currency?.id))
    return currencyIds.size > 1
  }, [accounts])

  const summaryCurrency = useMemo(() => {
    if (accounts.length === 0 || hasMixedCurrencies) return undefined
    return accounts[0].currency
  }, [accounts, hasMixedCurrencies])

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {}
    accounts.forEach((account) => {
      const cat = account.type ?? 'Autre'
      if (!map[cat]) map[cat] = { count: 0, total: 0 }
      map[cat].count += 1
      map[cat].total += account.balance
    })
    return Object.entries(map).map(([name, data]) => ({ name, ...data }))
  }, [accounts])

  const topAccount = useMemo(
    () => accounts.reduce<Account | null>((best, acc) => (!best || acc.balance > best.balance ? acc : best), null),
    [accounts],
  )

  const avgBalance = useMemo(
    () => (accounts.length ? totalBalance / accounts.length : 0),
    [accounts, totalBalance],
  )

  const fetchAccounts = async () => {
    setError('')
    const response = await axios.get<Account[]>(`${API_URL}/api/accounts`)
    setAccounts(response.data)
  }

  useEffect(() => {
    fetchAccounts()
      .catch(() => setError('Impossible de charger les comptes.'))
      .finally(() => setIsLoading(false))
  }, [])

  const CATEGORY_COLORS = ['#4f8ef7', '#34d399', '#f59e42', '#f472b6', '#a78bfa', '#fb923c']

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />

      <div className="app-shell">
        <Sidebar
          navItems={navItems}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Main area */}
        <div className="main-wrapper">
          {/* Top bar */}
          <header className="topbar">
            <div className="topbar-left">
              <p className="topbar-eyebrow">Dashboard</p>
              <h1 className="topbar-title">Vue d'ensemble</h1>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => (window.location.href = '/transactions/new')}
              >
                <i className="bx bx-transfer" />
                Virement rapide
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => (window.location.href = '/dashboard/create')}
              >
                <i className="bx bx-plus" />
                Nouveau compte
              </button>
            </div>
          </header>

          <main className="dashboard-content">
            {/* Stat cards */}
            <section className="stats-row">
              <div className="stat-card accent-blue">
                <div className="stat-icon"><i className="bx bx-money" /></div>
                <div className="stat-body">
                  <span className="stat-label">Solde total</span>
                  <strong className="stat-value">{formatCurrency(totalBalance, summaryCurrency)}</strong>
                  {hasMixedCurrencies && <span className="stat-sub">Devises mixtes</span>}
                </div>
              </div>
              <div className="stat-card accent-green">
                <div className="stat-icon"><i className="bx bx-wallet-alt" /></div>
                <div className="stat-body">
                  <span className="stat-label">Comptes actifs</span>
                  <strong className="stat-value">{accounts.length}</strong>
                  <span className="stat-sub">compte{accounts.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="stat-card accent-orange">
                <div className="stat-icon"><i className="bx bx-trending-up" /></div>
                <div className="stat-body">
                  <span className="stat-label">Solde moyen</span>
                  <strong className="stat-value">{formatCurrency(avgBalance, summaryCurrency)}</strong>
                  <span className="stat-sub">par compte</span>
                </div>
              </div>
              <div className="stat-card accent-purple">
                <div className="stat-icon"><i className="bx bxs-star" /></div>
                <div className="stat-body">
                  <span className="stat-label">Meilleur compte</span>
                  <strong className="stat-value">{topAccount?.name ?? '—'}</strong>
                  <span className="stat-sub">
                    {topAccount ? formatCurrency(topAccount.balance, topAccount.currency) : ''}
                  </span>
                </div>
              </div>
            </section>

            <div className="content-columns">
              <section className="accounts-section">
                <div className="section-header">
                  <h2><i className="bx bx-wallet" /> Mes comptes</h2>
                  <a href="/dashboard/accounts" className="see-all">Voir tout <i className="bx bx-chevron-right" /></a>
                </div>

                {isLoading && (
                  <div className="dashboard-state">
                    <i className="bx bx-loader-alt bx-spin" />
                    <span>Chargement des comptes…</span>
                  </div>
                )}
                {error && (
                  <div className="dashboard-error">
                    <i className="bx bx-error-circle" />
                    <span>{error}</span>
                  </div>
                )}
                {!isLoading && !error && (
                  accounts.length > 0 ? (
                    <div className="accounts-grid">
                      {accounts.map((account) => (
                        <AccountCard key={account.id} account={account} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-accounts">
                      <i className="bx bx-folder-open" />
                      <h3>Aucun compte actif</h3>
                      <p>Ajoutez votre premier compte pour commencer à suivre votre argent.</p>
                      <a href="/dashboard/create" className="btn btn-primary">
                        <i className="bx bx-plus" /> Créer un compte
                      </a>
                    </div>
                  )
                )}
              </section>

              {/* Right panel */}
              <aside className="right-panel">
                {/* Category breakdown */}
                <div className="panel-card">
                  <div className="section-header">
                    <h2><i className="bx bx-pie-chart-alt-2" /> Répartition</h2>
                  </div>
                  {categoryStats.length === 0 ? (
                    <p className="panel-empty">Aucune donnée</p>
                  ) : (
                    <ul className="category-list">
                      {categoryStats.map((cat, i) => {
                        const pct = totalBalance > 0 ? Math.round((cat.total / totalBalance) * 100) : 0
                        return (
                          <li key={cat.name} className="category-item">
                            <div className="category-top">
                              <span className="category-dot" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                              <span className="category-name">{cat.name}</span>
                              <span className="category-pct">{pct}%</span>
                            </div>
                            <div className="category-bar-bg">
                              <div
                                className="category-bar-fill"
                                style={{ width: `${pct}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                              />
                            </div>
                            <div className="category-meta">
                              <span>{cat.count} compte{cat.count !== 1 ? 's' : ''}</span>
                              <span>{formatCurrency(cat.total, summaryCurrency)}</span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                {/* Quick actions */}
                <div className="panel-card quick-actions">
                  <div className="section-header">
                    <h2><i className="bx bx-zap" /> Actions rapides</h2>
                  </div>
                  <a href="/transactions/new" className="quick-action-btn">
                    <i className="bx bx-transfer" />
                    <span>Effectuer un virement</span>
                    <i className="bx bx-chevron-right arrow" />
                  </a>
                  <a href="/dashboard/accounts" className="quick-action-btn">
                    <i className="bx bx-list-ul" />
                    <span>Liste des comptes</span>
                    <i className="bx bx-chevron-right arrow" />
                  </a>
                  <a href="/dashboard/create" className="quick-action-btn">
                    <i className="bx bx-plus-circle" />
                    <span>Nouveau compte</span>
                    <i className="bx bx-chevron-right arrow" />
                  </a>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}