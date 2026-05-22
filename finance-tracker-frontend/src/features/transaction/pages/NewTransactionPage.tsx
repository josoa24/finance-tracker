import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import type { Account } from '../../accounts/types'
import './new-transaction.css'

const FALLBACK_CATEGORIES = ['SALARY', 'FOOD', 'RENT', 'TRANSPORT', 'LEISURE', 'OTHER']
const FALLBACK_TYPES = ['INCOME', 'EXPENSE']

export default function NewTransactionPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('transactions')

  const [accountId, setAccountId] = useState<number | null>(null)
  const [type, setType] = useState<string>('EXPENSE')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORIES[1])
  const [types, setTypes] = useState<string[]>(FALLBACK_TYPES)
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES)
  const [amount, setAmount] = useState<number | ''>('')
  const [transactionDate, setTransactionDate] = useState<string>(() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [warningMsg, setWarningMsg] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        setAccounts(res.data)
        if (res.data.length > 0) setAccountId(res.data[0].id)
      } catch {
        setError('Impossible de charger les comptes.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          axios.get<string[]>(`${API_URL}/api/transactions/types`),
          axios.get<string[]>(`${API_URL}/api/transactions/categories`),
        ])
        if (Array.isArray(tRes.data) && tRes.data.length > 0) {
          setTypes(tRes.data)
          setType((prev) => (tRes.data.includes(prev) ? prev : tRes.data[0]))
        }
        if (Array.isArray(cRes.data) && cRes.data.length > 0) {
          setCategories(cRes.data)
          setCategory((prev) => (cRes.data.includes(prev) ? prev : cRes.data[0]))
        }
      } catch {}
    }
    fetchEnums()
  }, [])

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId]
  )

  const previewBalance = useMemo(() => {
    if (!selectedAccount || amount === '') return selectedAccount?.balance ?? 0
    const amt = Number(amount)
    return type === 'INCOME' ? selectedAccount.balance + amt : selectedAccount.balance - amt
  }, [selectedAccount, amount, type])

  const wouldBeNegative = previewBalance < 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setWarningMsg('')

    if (!accountId) return setError('Veuillez sélectionner un compte.')
    if (!amount || Number(amount) <= 0) return setError('Le montant doit être supérieur à zéro.')
    if (wouldBeNegative) return setError('Le solde du compte ne peut pas devenir négatif.')

    setSubmitting(true)
    try {
      const payload = {
        accountId,
        amount: Number(amount),
        type,
        category,
        transactionDate: transactionDate + ':00',
        note: note || null,
      }
      const response = await axios.post(`${API_URL}/api/transactions`, payload)
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, balance: previewBalance } : a))
      )
      setSuccessMsg('Transaction enregistrée avec succès.')
      if (response.data?.limitExceededWarning && response.data?.warningMessage) {
        setWarningMsg(response.data.warningMessage)
      }
      setAmount('')
      setNote('')
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Erreur lors de la création de la transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (n: number, code?: string) =>
    `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code ?? 'EUR'}`

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
                <p className="dashboard-eyebrow">Transactions</p>
                <h1>Créer une transaction</h1>
              </div>
            </section>

            {isLoading && <p className="dashboard-state">Chargement des comptes…</p>}
            {error && <p className="dashboard-error">{error}</p>}
            {successMsg && <p className="dashboard-success">{successMsg}</p>}
            {warningMsg && <div className="tx-warning">{warningMsg}</div>}

            {!isLoading && (
              <div className="tx-form-card">
                <form className="tx-form-grid" onSubmit={handleSubmit}>

                  <div className="tx-field tx-field--full">
                    <label>Compte</label>
                    <select value={accountId ?? ''} onChange={(e) => setAccountId(Number(e.target.value))}>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} — {fmt(a.balance, a.currency?.code)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tx-field">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="tx-field">
                    <label>Catégorie</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="tx-field">
                    <label>Montant</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount as any}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>

                  <div className="tx-field">
                    <label>Date et heure</label>
                    <input
                      type="datetime-local"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                    />
                  </div>

                  <div className="tx-field tx-field--full">
                    <label>Note (optionnel)</label>
                    <input
                      type="text"
                      placeholder="Ajouter une note…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <div className="tx-preview">
                    <div className="tx-preview-item">
                      <span className="tx-preview-label">Solde actuel</span>
                      <span className="tx-preview-value">
                        {selectedAccount ? fmt(selectedAccount.balance, selectedAccount.currency?.code) : '—'}
                      </span>
                    </div>
                    <span className="tx-preview-arrow">→</span>
                    <div className="tx-preview-item">
                      <span className="tx-preview-label">Solde après opération</span>
                      <span className={`tx-preview-value ${wouldBeNegative ? 'tx-preview-value--danger' : ''}`}>
                        {selectedAccount ? fmt(previewBalance, selectedAccount.currency?.code) : '—'}
                      </span>
                    </div>
                    {wouldBeNegative && (
                      <p className="tx-preview-error">Cette opération rendrait le solde négatif.</p>
                    )}
                  </div>

                  <div className="tx-actions">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={submitting || wouldBeNegative}
                    >
                      {submitting ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin" />
                          Enregistrement…
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save" />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}