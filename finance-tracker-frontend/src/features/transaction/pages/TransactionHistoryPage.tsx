import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_URL } from '../../../url'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import TransactionList from '../components/TransactionList'
import type { Account } from '../../accounts/types'

export default function TransactionHistoryPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('history')
  const [selectedAccount, setSelectedAccount] = useState<number | 'all'>('all')

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const accRes = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        setAccounts(accRes.data)

        // if selecting all, fetch for each account and aggregate
        const txPromises = accRes.data.map((a) => axios.get(`${API_URL}/api/transactions/account/${a.id}`))
        const txResults = await Promise.all(txPromises)
        const allTxs = txResults.flatMap((r, i) => {
          const account = accRes.data[i]
          return (r.data || []).map((tx: any) => ({
            ...tx,
            accountId: account.id,
            accountName: account.name,
            accountCurrency: account.currency,
          }))
        })

        // sort by date desc
        allTxs.sort((a: any, b: any) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())

        setTransactions(allTxs)
      } catch (e: any) {
        setError('Impossible de charger l\'historique des transactions.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [])

  const handleAccountChange = async (value: string) => {
    if (value === 'all') {
      setSelectedAccount('all')
      // reload all (we already have them, but refetch for simplicity)
      setIsLoading(true)
      try {
        const txPromises = accounts.map((a) => axios.get(`${API_URL}/api/transactions/account/${a.id}`))
        const txResults = await Promise.all(txPromises)
        const allTxs = txResults.flatMap((r, i) => {
          const accName = accounts[i].name
          return (r.data || []).map((tx: any) => ({ ...tx, accountId: accounts[i].id, accountName: accName }))
        })
        allTxs.sort((a: any, b: any) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        setTransactions(allTxs)
      } catch (e) {
        setError('Impossible de charger les transactions.')
      } finally {
        setIsLoading(false)
      }
    } else {
      const accId = Number(value)
      setSelectedAccount(accId)
      setIsLoading(true)
      try {
        const res = await axios.get(`${API_URL}/api/transactions/account/${accId}`)
        const account = accounts.find((a) => a.id === accId)
        const txs = (res.data || []).map((tx: any) => ({
          ...tx,
          accountId: accId,
          accountName: account?.name,
          accountCurrency: account?.currency,
        }))
        txs.sort((a: any, b: any) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        setTransactions(txs)
      } catch (e) {
        setError('Impossible de charger les transactions pour ce compte.')
      } finally {
        setIsLoading(false)
      }
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
          accountId={selectedAccount === 'all' ? null : (selectedAccount as number)}
        />

        <div className="main-wrapper">
          <main className="accounts-dashboard">
            <section className="dashboard-hero">
              <div>
                <p className="dashboard-eyebrow">Historique</p>
                <h1>Historique des transactions</h1>
              </div>
            </section>

            <div className="history-controls">
              <label>
                Filtrer par compte
                <select value={selectedAccount === 'all' ? 'all' : String(selectedAccount)} onChange={(e) => handleAccountChange(e.target.value)}>
                  <option value="all">Tous les comptes</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {isLoading && <p className="dashboard-state">Chargement des transactions...</p>}
            {error && <p className="dashboard-error">{error}</p>}

            {!isLoading && !error && (
              transactions.length === 0 ? (
                <p className="empty-state">Aucune transaction trouvée.</p>
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
