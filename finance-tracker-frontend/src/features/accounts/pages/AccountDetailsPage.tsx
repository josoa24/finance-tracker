import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../../../url'
import type { Account } from '../types'
import { formatAccountDate, formatCurrency, accountTypeLabels } from '../utils'

function AccountDetailsPage({ id }: { id: number }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [summary, setSummary] = useState<any | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchAccount = async () => {
      setIsLoading(true)
      setError('')
      try {
        // try single-account endpoint first
        try {
          const resp = await axios.get(`${API_URL}/api/accounts/${id}`)
          if (!mounted) return
          setAccount(resp.data)
          return
        } catch (err: any) {
          // if not found, fall back to list endpoint
          if (err?.response?.status && err.response.status !== 404) throw err
        }

        const resp = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        if (!mounted) return
        const found = resp.data.find((a) => a.id === id)
        if (!found) {
          setError('Compte introuvable')
        } else {
          setAccount(found)
        }
      } catch {
        setError('Impossible de charger les details du compte.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccount()
    return () => {
      mounted = false
    }
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Confirmer la suppression de ce compte ?")) return
    setDeleteError('')
    setIsDeleting(true)
    try {
      await axios.delete(`${API_URL}/api/accounts/${id}`)
      window.location.assign('/dashboard')
    } catch (err: any) {
      if (err?.response?.status === 400 || err?.response?.status === 409) {
        setDeleteError('Impossible de supprimer un compte possédant des transactions.')
      } else {
        setDeleteError('Erreur lors de la suppression du compte.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <p>Chargement...</p>
  if (error) return <p className="dashboard-error">{error}</p>
  if (!account) return null

  return (
    <main className="account-details">
      <section className="details-hero">
        <h1>{account.name}</h1>
        <p>{accountTypeLabels[account.type]}</p>
      </section>

      <section className="details-body">
        <p>
          <strong>Solde:</strong> {formatCurrency(account.balance, account.currency)}
        </p>
        <p>
          <strong>Devise:</strong> {`${account.currency.symbol} (${account.currency.code})`}
        </p>
        <p>
          <strong>Crée le:</strong> {formatAccountDate(account.createdAt)}
        </p>

        <div className="details-actions">
          <button className="danger-button" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Supprimer le compte'}
          </button>
        </div>

        {deleteError && <div className="notification error">{deleteError}</div>}

        <section className="transactions-placeholder">
          <h2>Historique des transactions</h2>
          <p>Liste des transactions (module 2)</p>
        </section>

        <section className="monthly-summary">
          <h2>Récapitulatif mensuel</h2>
          <label>
            Choisir mois
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          <div style={{ marginTop: 12 }}>
            <button
              className="primary-button"
              onClick={async () => {
                setSummaryError('')
                setLoadingSummary(true)
                try {
                  const [y, m] = month.split('-')
                  const res = await axios.get(`${API_URL}/api/transactions/account/${id}/summary/${Number(y)}/${Number(m)}`)
                  setSummary(res.data)
                } catch (err: any) {
                  setSummaryError('Impossible de charger le résumé.')
                } finally {
                  setLoadingSummary(false)
                }
              }}
            >
              Charger
            </button>
          </div>

          {loadingSummary && <p>Chargement du résumé...</p>}
          {summaryError && <p className="dashboard-error">{summaryError}</p>}

          {summary && (
            <div style={{ marginTop: 12 }}>
              <p><strong>Total revenus:</strong> {summary.totalIncome?.toLocaleString() ?? 0}</p>
              <p><strong>Total dépenses:</strong> {summary.totalExpenses?.toLocaleString() ?? 0}</p>
              <p><strong>Net:</strong> {summary.net?.toLocaleString() ?? 0}</p>

              <h3>Dépenses par catégorie</h3>
              {summary.categories.length === 0 ? (
                <p>Aucune dépense ce mois.</p>
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
        </section>
      </section>
    </main>
  )
}

export default AccountDetailsPage
