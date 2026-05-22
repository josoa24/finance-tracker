import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import type { Account } from '../../accounts/types'

const FALLBACK_CATEGORIES = ['SALARY', 'FOOD', 'RENT', 'TRANSPORT', 'LEISURE', 'OTHER']
const FALLBACK_TYPES = ['INCOME', 'EXPENSE']

export default function NewTransactionPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('transfer')

  // form state
  const [accountId, setAccountId] = useState<number | null>(null)
  const [type, setType] = useState<string>('EXPENSE')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORIES[1])
  const [types, setTypes] = useState<string[]>(FALLBACK_TYPES)
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES)
  const [amount, setAmount] = useState<number | ''>('')
  const [transactionDate, setTransactionDate] = useState<string>(() => {
    const now = new Date()
    const tzOffset = now.getTimezoneOffset() * 60000
    const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
    return localISO
  })
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get<Account[]>(`${API_URL}/api/accounts`)
        setAccounts(res.data)
        if (res.data.length > 0) setAccountId(res.data[0].id)
      } catch (e) {
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
          axios.get<string[]>(`${API_URL}/api/transactions/categories`)
        ])
        if (Array.isArray(tRes.data) && tRes.data.length > 0) {
          setTypes(tRes.data)
          setType(tRes.data.includes(type) ? type : tRes.data[0])
        }
        if (Array.isArray(cRes.data) && cRes.data.length > 0) {
          setCategories(cRes.data)
          setCategory(cRes.data.includes(category) ? category : cRes.data[0])
        }
      } catch (e) {
        // keep fallbacks on error
      }
    }
    fetchEnums()
  }, [])

  const selectedAccount = useMemo(() => accounts.find((a) => a.id === accountId) ?? null, [accounts, accountId])

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

      await axios.post(`${API_URL}/api/transactions`, payload)

      // update account balance locally
      setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, balance: previewBalance } : a)))
      setSuccessMsg('Transaction enregistrée avec succès.')
      setAmount('')
      setNote('')
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Erreur lors de la création de la transaction.')
    } finally {
      setSubmitting(false)
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
                <p className="dashboard-eyebrow">Transactions</p>
                <h1>Créer une transaction</h1>
              </div>
            </section>

            {isLoading && <p className="dashboard-state">Chargement des comptes...</p>}
            {error && <p className="dashboard-error">{error}</p>}
            {successMsg && <p className="dashboard-success">{successMsg}</p>}

            {!isLoading && !error && (
              <section className="create-account-page">
                <form className="transaction-form" onSubmit={handleSubmit}>
                  <label>
                    Compte
                    <select value={accountId ?? ''} onChange={(e) => setAccountId(Number(e.target.value))}>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} — {a.balance.toLocaleString()} {a.currency?.code ?? 'EUR'}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Type
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  <label>
                    Catégorie
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>

                  <label>
                    Montant
                    <input type="number" step="0.01" min="0" value={amount as any} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                  </label>

                  <label>
                    Date et heure
                    <input type="datetime-local" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
                  </label>

                  <label>
                    Note (optionnel)
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
                  </label>

                  <div className="preview-balance">
                    Solde actuel: {selectedAccount ? `${selectedAccount.balance.toLocaleString()} ${selectedAccount.currency?.code ?? 'EUR'}` : '—'}
                    <br />
                    Solde après opération: {selectedAccount ? `${previewBalance.toLocaleString()} ${selectedAccount.currency?.code ?? 'EUR'}` : '—'}
                    {wouldBeNegative && <div className="validation-error">Cette opération rendrait le solde négatif.</div>}
                  </div>

                  <div className="form-actions">
                    <button type="submit" disabled={submitting || wouldBeNegative}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
                  </div>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
