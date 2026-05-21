import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import AccountCard from '../components/AccountCard'
import Sidebar from '../components/Sidebar'
import './AccountsDashboardPage.css'
import type { Account } from '../types'
import { formatCurrency } from '../utils'



export default function AccountsDashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const totalBalance = useMemo(
    () => accounts.reduce((total, account) => total + account.balance, 0),
    [accounts],
  )

  const hasMixedCurrencies = useMemo(() => {
    const currencyIds = new Set(accounts.map((account) => account.currency?.id))
    return currencyIds.size > 1
  }, [accounts])

  const summaryCurrency = useMemo(() => {
    if (accounts.length === 0 || hasMixedCurrencies) {
      return undefined
    }
    return accounts[0].currency
  }, [accounts, hasMixedCurrencies])

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

  return (
    <>
      <main className="accounts-dashboard">

        {/* Top bar */}
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Dashboard</p>
            <h1>Vue d'ensemble des comptes</h1>
          </div>
          <div className="dashboard-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => (window.location.href = '/dashboard/transfer')}
            >
              Virement rapide
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => (window.location.href = '/dashboard/create')}
            >
              + Nouveau compte
            </button>
          </div>
        </section>

        {/* Balance summary */}
        <section className="balance-summary" aria-label="Solde total">
          <span>Solde total cumulé</span>
          <strong>{formatCurrency(totalBalance, summaryCurrency)}</strong>
          <p>
            {accounts.length} compte{accounts.length !== 1 ? 's' : ''} actif{accounts.length !== 1 ? 's' : ''}
            {hasMixedCurrencies ? ' • Devises mixtes' : ''}
          </p>
        </section>

        {/* States */}
        {isLoading && <p className="dashboard-state">Chargement des comptes…</p>}
        {error && <p className="dashboard-error">{error}</p>}

        {/* Main content */}
        {!isLoading && !error && (
          <section className="accounts-layout">
            <Sidebar accounts={accounts} />
            <section className="accounts-grid" aria-label="Liste des comptes">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))
              ) : (
                <div className="empty-accounts">
                  <h2>Aucun compte actif</h2>
                  <p>Ajoutez votre premier compte pour commencer à suivre votre argent.</p>
                </div>
              )}
            </section>
          </section>
        )}
      </main>
    </>
  )
}