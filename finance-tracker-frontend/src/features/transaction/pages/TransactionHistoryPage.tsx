import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../../../url'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import TransactionList from '../components/TransactionList'
import type { Account } from '../../accounts/types'
import './transaction-history.css'

export default function TransactionHistoryPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('history')
  const [selectedAccount, setSelectedAccount] = useState<number | 'all'>('all')

  const enrichAndSort = (txResults: any[], accountsList: Account[]) => {
    const allTxs = txResults.flatMap((r, i) => {
      const account = accountsList[i]
      return (r.data || []).map((tx: any) => ({
        ...tx,
        accountId: account.id,
        accountName: account.name,
        accountCurrency: account.currency,
      }))
    })
    allTxs.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    return allTxs
  }

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const accRes = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        setAccounts(accRes.data)
        const txResults = await Promise.all(
          accRes.data.map((a) => axios.get(`${API_URL}/api/transactions/account/${a.id}`))
        )
        setTransactions(enrichAndSort(txResults, accRes.data))
      } catch {
        setError("Impossible de charger l'historique des transactions.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleAccountChange = async (value: string) => {
    setError('')
    setIsLoading(true)
    try {
      if (value === 'all') {
        setSelectedAccount('all')
        const txResults = await Promise.all(
          accounts.map((a) => axios.get(`${API_URL}/api/transactions/account/${a.id}`))
        )
        setTransactions(enrichAndSort(txResults, accounts))
      } else {
        const accId = Number(value)
        setSelectedAccount(accId)
        const res = await axios.get(`${API_URL}/api/transactions/account/${accId}`)
        const account = accounts.find((a) => a.id === accId)
        const txs = (res.data || [])
          .map((tx: any) => ({
            ...tx,
            accountId: accId,
            accountName: account?.name,
            accountCurrency: account?.currency,
          }))
          .sort((a: any, b: any) =>
            new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
          )
        setTransactions(txs)
      }
    } catch {
      setError('Impossible de charger les transactions.')
    } finally {
      setIsLoading(false)
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
                <p className="dashboard-eyebrow">Historique</p>
                <h1>Historique des transactions</h1>
              </div>
              <div className="history-filter">
                <label htmlFor="account-filter">Filtrer par compte</label>
                <select
                  id="account-filter"
                  value={selectedAccount === 'all' ? 'all' : String(selectedAccount)}
                  onChange={(e) => handleAccountChange(e.target.value)}
                >
                  <option value="all">Tous les comptes</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </section>

            {isLoading && <p className="dashboard-state">Chargement des transactions…</p>}
            {error && <p className="dashboard-error">{error}</p>}

            {!isLoading && !error && (
              transactions.length === 0 ? (
                <div className="empty-accounts">
                  <i className="bx bx-transfer" />
                  <h3>Aucune transaction trouvée</h3>
                  <p>Les transactions apparaîtront ici après leur création.</p>
                </div>
              ) : (
                <TransactionList transactions={transactions} />
              )
            )}
          </main>
        </div>
      </div>
    </>
  )
}