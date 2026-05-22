import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../../../url'
import TransferMoneyModal from '../components/TransferMoneyModal'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import type { Account, TransferMoneyPayload } from '../types'
import './create-account-page.css'

function TransferMoneyPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('transfer')

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
        </div>
      </div>
    </>
  )
}

export default TransferMoneyPage
