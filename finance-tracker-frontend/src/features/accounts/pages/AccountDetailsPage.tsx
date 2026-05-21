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
      </section>
    </main>
  )
}

export default AccountDetailsPage
