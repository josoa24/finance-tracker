import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import type { Account } from '../../accounts/types'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'

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
      } catch (err) {
        setAccountsError('Impossible de charger les comptes ou catégories.')
      } finally {
        setLoadingAccounts(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleLoadMonth = async () => {
    if (!selectedAccount) return
    setSummaryError('')
    setLoadingSummary(true)
    setSummary(null)
    try {
      const [y, m] = month.split('-')
      const res = await axios.get(`${API_URL}/api/transactions/account/${selectedAccount}/summary/${Number(y)}/${Number(m)}`)
      setSummary(res.data)
    } catch (err) {
      setSummaryError('Impossible de charger le résumé mensuel.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleLoadRange = async () => {
    if (!selectedAccount) return
    if (!fromDate || !toDate) {
      setSummaryError('Choisir une date de début et de fin.')
      return
    }
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
    } catch (err) {
      setSummaryError('Impossible de charger les transactions pour cette période.')
    } finally {
      setLoadingSummary(false)
    }
  }

  const accountOptions = useMemo(() => accounts.map((a) => ({ id: a.id, label: `${a.name} (${a.currency?.code ?? '—'})` })), [accounts])

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />

      <div className="app-shell">
        <Sidebar navItems={navItems} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage={activePage} setActivePage={setActivePage} />

        <div className="main-wrapper">
          <header className="topbar">
            <div className="topbar-left">
              <p className="topbar-eyebrow">Analytics</p>
              <h1 className="topbar-title">Récapitulatif</h1>
            </div>
          </header>

          <main className="dashboard-content">
            <h2>Récapitulatif mensuel</h2>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <label>
                Compte
                <select value={selectedAccount ?? ''} onChange={(e) => setSelectedAccount(Number(e.target.value))}>
                  {accountOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" checked={mode === 'month'} onChange={() => setMode('month')} /> Par mois
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="radio" checked={mode === 'range'} onChange={() => setMode('range')} /> Entre deux dates
              </label>
            </div>

            {mode === 'month' ? (
              <div className="monthly-summary">
                <label>
                  Choisir mois
                  <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </label>
                <div style={{ marginTop: 12 }}>
                  <button className="primary-button" onClick={handleLoadMonth} disabled={loadingSummary || !selectedAccount}>
                    Charger
                  </button>
                </div>
              </div>
            ) : (
              <div className="date-range-filter">
                <label>
                  De
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </label>
                <label>
                  À
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </label>
                <div style={{ marginTop: 12 }}>
                  <button className="primary-button" onClick={handleLoadRange} disabled={loadingSummary || !selectedAccount}>
                    Filtrer
                  </button>
                </div>
              </div>
            )}

            {loadingAccounts && <p>Chargement des comptes...</p>}
            {accountsError && <p className="dashboard-error">{accountsError}</p>}

            {loadingSummary && <p>Chargement du résumé...</p>}
            {summaryError && <p className="dashboard-error">{summaryError}</p>}

            {summary && (
              <div style={{ marginTop: 12 }}>
                <p><strong>Total revenus:</strong> {summary.totalIncome?.toLocaleString() ?? 0}</p>
                <p><strong>Total dépenses:</strong> {summary.totalExpenses?.toLocaleString() ?? 0}</p>
                <p><strong>Net:</strong> {summary.net?.toLocaleString() ?? 0}</p>

                <h3>Dépenses par catégorie</h3>
                {summary.categories.length === 0 ? (
                  <p>Aucune dépense pour la période sélectionnée.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {summary.categories.map((c: any) => (
                      <li key={c.categoryId} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{c.categoryName}</strong>
                          <span>{c.spent?.toLocaleString() ?? 0} / {c.monthlyLimit ?? '—'}</span>
                        </div>
                        <div style={{ height: 10, background: '#eee', borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ width: `${c.progress ? Math.min(c.progress, 100) : 0}%`, height: '100%', background: c.progress && c.progress > 100 ? '#f87171' : '#60a5fa' }} />
                        </div>
                      </li>
                    ))}
                  </ul>
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
