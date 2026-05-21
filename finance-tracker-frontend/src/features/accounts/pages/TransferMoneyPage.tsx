import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../../../url'
import TransferMoneyModal from '../components/TransferMoneyModal'
import type { Account, TransferMoneyPayload } from '../types'
import './AccountsDashboardPage.css'

function TransferMoneyPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      setError('')
      try {
        const response = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        setAccounts(response.data)
      } catch {
        setError('Impossible de charger les comptes.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleSubmit = async (payload: TransferMoneyPayload) => {
    setError('')
    try {
      await axios.post(`${API_URL}/api/accounts/transfer`, payload)
      window.location.assign('/dashboard')
    } catch {
      setError('Impossible de realiser le virement pour le moment.')
    }
  }

  return (
    <main className="accounts-dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Dashboard</p>
          <h1>Virement entre comptes</h1>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="secondary-button" onClick={() => window.location.assign('/dashboard')}>
            Retour
          </button>
        </div>
      </section>

      {isLoading && <p className="dashboard-state">Chargement des comptes...</p>}
      {error && <p className="dashboard-error">{error}</p>}

      {!isLoading && !error && (
        <section className="create-account-page">
          <TransferMoneyModal accounts={accounts} onCancel={() => window.location.assign('/dashboard')} onSubmit={handleSubmit} />
        </section>
      )}
    </main>
  )
}

export default TransferMoneyPage
