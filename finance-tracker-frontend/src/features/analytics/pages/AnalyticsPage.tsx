import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import type { Account } from '../../accounts/types'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import './analytics.css'

const COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#D4537E', '#BA7517', '#639922', '#888780']

const CATEGORY_COLORS: Record<string, string> = {
  SALARY:    '#639922',
  FOOD:      '#BA7517',
  RENT:      '#7F77DD',
  TRANSPORT: '#378ADD',
  LEISURE:   '#D4537E',
  OTHER:     '#888780',
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : {}}>{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

const fmt = (n: number, code = 'EUR') =>
  `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: 13 }}>
          {p.name} : {p.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

function AnalyticsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [accountsError, setAccountsError] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [mode, setMode] = useState<'month' | 'range'>('month')
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [summary, setSummary] = useState<any | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [categoriesMap, setCategoriesMap] = useState<Record<number, any>>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('analytics')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadingAccounts(true)
      setAccountsError('')
      try {
        const res = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        if (!mounted) return
        setAccounts(res.data)
        if (res.data.length > 0) setSelectedAccount(res.data[0].id)
        const catRes = await axios.get(`${API_URL}/api/categories`)
        if (!mounted) return
        const map: Record<number, any> = {}
        Array.isArray(catRes.data) && catRes.data.forEach((c: any) => (map[c.id] = c))
        setCategoriesMap(map)
      } catch {
        setAccountsError('Impossible de charger les comptes ou catégories.')
      } finally {
        setLoadingAccounts(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleLoadMonth = async () => {
    if (!selectedAccount) return
    setSummaryError('')
    setLoadingSummary(true)
    setSummary(null)
    try {
      const [y, m] = month.split('-')
      const res = await axios.get(
        `${API_URL}/api/transactions/account/${selectedAccount}/summary/${Number(y)}/${Number(m)}`
      )
      setSummary(res.data)
    } catch {
      setSummaryError('Impossible de charger le résumé mensuel.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleLoadRange = async () => {
    if (!selectedAccount) return
    if (!fromDate || !toDate) { setSummaryError('Choisir une date de début et de fin.'); return }
    setSummaryError('')
    setLoadingSummary(true)
    setSummary(null)
    try {
      const res = await axios.get(`${API_URL}/api/transactions/account/${selectedAccount}`)
      const txs = Array.isArray(res.data) ? res.data : []
      const from = new Date(fromDate)
      const to = new Date(toDate)
      const filtered = txs.filter((t: any) => {
        const d = new Date(t.transactionDate)
        return d >= from && d <= to
      })
      const totalIncome = filtered.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
      const totalExpenses = filtered.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
      const byCat: Record<number, any> = {}
      filtered.forEach((t: any) => {
        const cid = t.categoryId ?? -1
        if (!byCat[cid]) byCat[cid] = { categoryId: cid, categoryName: t.categoryName ?? t.category ?? '—', spent: 0 }
        if (t.type === 'EXPENSE') byCat[cid].spent += t.amount ?? 0
      })
      const cats = Object.values(byCat).map((c: any) => {
        const meta = categoriesMap[c.categoryId]
        const monthlyLimit = meta ? meta.monthlyLimit : null
        const progress = monthlyLimit ? (c.spent / monthlyLimit) * 100 : null
        return { ...c, monthlyLimit, progress }
      })
      setSummary({ totalIncome, totalExpenses, net: totalIncome - totalExpenses, categories: cats })
    } catch {
      setSummaryError('Impossible de charger les transactions pour cette période.')
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    if (!selectedAccount) return
    if (mode === 'month') {
      handleLoadMonth()
    } else {
      if (fromDate && toDate) handleLoadRange()
    }
  }, [selectedAccount, mode, month, fromDate, toDate])

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ id: a.id, label: `${a.name} (${a.currency?.code ?? '—'})` })),
    [accounts]
  )

  const selectedAcc = accounts.find((a) => a.id === selectedAccount)
  const currencyCode = selectedAcc?.currency?.code ?? 'EUR'

  const pieData = useMemo(() => {
    if (!summary?.categories) return []
    return summary.categories
      .filter((c: any) => c.spent > 0)
      .map((c: any) => ({ name: c.categoryName, value: c.spent }))
  }, [summary])

  const barData = useMemo(() => {
    if (!summary) return []
    return [
      { name: 'Revenus', value: summary.totalIncome ?? 0, fill: '#1D9E75' },
      { name: 'Dépenses', value: summary.totalExpenses ?? 0, fill: '#D85A30' },
      { name: 'Net', value: summary.net ?? 0, fill: summary.net >= 0 ? '#378ADD' : '#D85A30' },
    ]
  }, [summary])

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
        <div className="main-wrapper">
          <main className="accounts-dashboard">
            <section className="dashboard-hero">
              <div>
                <p className="dashboard-eyebrow">Analytics</p>
                <h1>Récapitulatif</h1>
              </div>
            </section>

            <div className="analytics-controls">
              <div className="analytics-field">
                <label>Compte</label>
                <select value={selectedAccount ?? ''} onChange={(e) => setSelectedAccount(Number(e.target.value))}>
                  {accountOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="analytics-mode-toggle">
                <button
                  className={`mode-btn ${mode === 'month' ? 'mode-btn--active' : ''}`}
                  onClick={() => setMode('month')}
                >
                  <i className="bx bx-calendar" /> Par mois
                </button>
                <button
                  className={`mode-btn ${mode === 'range' ? 'mode-btn--active' : ''}`}
                  onClick={() => setMode('range')}
                >
                  <i className="bx bx-calendar-range" /> Plage de dates
                </button>
              </div>

              {mode === 'month' ? (
                <div className="analytics-field">
                  <label>Mois</label>
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
              ) : (
                <>
                  <div className="analytics-field">
                    <label>De</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div className="analytics-field">
                    <label>À</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={mode === 'month' ? handleLoadMonth : handleLoadRange}
                disabled={loadingSummary || !selectedAccount}
              >
                {loadingSummary ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" />
                    Chargement…
                  </>
                ) : (
                  <>
                    <i className="bx bx-chart" />
                    Analyser
                  </>
                )}
              </button>
            </div>

            {loadingAccounts && <p className="dashboard-state">Chargement des comptes…</p>}
            {accountsError && <p className="dashboard-error">{accountsError}</p>}
            {summaryError && <p className="dashboard-error">{summaryError}</p>}

            {summary && (
              <div className="analytics-body">

                <div className="stat-cards">
                  <StatCard
                    label="Total revenus"
                    value={fmt(summary.totalIncome ?? 0, currencyCode)}
                    color="#1D9E75"
                  />
                  <StatCard
                    label="Total dépenses"
                    value={fmt(summary.totalExpenses ?? 0, currencyCode)}
                    color="#D85A30"
                  />
                  <StatCard
                    label="Solde net"
                    value={fmt(summary.net ?? 0, currencyCode)}
                    color={(summary.net ?? 0) >= 0 ? '#185FA5' : '#A32D2D'}
                  />
                  {summary.categories?.length > 0 && (
                    <StatCard
                      label="Catégories actives"
                      value={String(summary.categories.filter((c: any) => c.spent > 0).length)}
                    />
                  )}
                </div>

                <div className="analytics-charts">
                  <div className="chart-card">
                    <h3>Vue d'ensemble</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} barSize={48}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {barData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {pieData.length > 0 && (
                    <div className="chart-card">
                      <h3>Dépenses par catégorie</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry: any, i: number) => (
                              <Cell
                                key={i}
                                fill={CATEGORY_COLORS[entry.name?.toUpperCase()] ?? COLORS[i % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: any) => (typeof v === 'number' ? v.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '')} />
                          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {summary.categories?.length > 0 && (
                  <div className="chart-card chart-card--full">
                    <h3>Détail par catégorie</h3>
                    <div className="category-rows">
                      {summary.categories
                        .filter((c: any) => c.spent > 0)
                        .sort((a: any, b: any) => b.spent - a.spent)
                        .map((c: any) => {
                          const pct = c.progress != null ? Math.min(c.progress, 100) : null
                          const over = c.progress != null && c.progress > 100
                          const color = CATEGORY_COLORS[c.categoryName?.toUpperCase()] ?? '#888780'
                          return (
                            <div key={c.categoryId} className="cat-row">
                              <div className="cat-row-header">
                                <span className="cat-row-name">{c.categoryName}</span>
                                <span className="cat-row-amounts">
                                  <span className="cat-row-spent">{fmt(c.spent, currencyCode)}</span>
                                  {c.monthlyLimit && (
                                    <span className="cat-row-limit">/ {fmt(c.monthlyLimit, currencyCode)}</span>
                                  )}
                                  {over && <span className="cat-row-over">Dépassé</span>}
                                </span>
                              </div>
                              {pct != null && (
                                <div className="cat-progress-track">
                                  <div
                                    className="cat-progress-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: over ? '#D85A30' : color,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default AnalyticsPage