import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AccountType, CreateAccountPayload } from '../types'
import { accountTypeLabels } from '../utils'
import axios from 'axios'
import { API_URL } from '../../../url'

type Currency = {
  id: number
  code: string
  symbol: string
}

type CreateAccountFormProps = {
  onCancel: () => void
  onSubmit: (payload: CreateAccountPayload) => Promise<void>
}

function CreateAccountForm({ onCancel, onSubmit }: CreateAccountFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('CHECKING')
  const [accountTypes, setAccountTypes] = useState<AccountType[]>(['CHECKING', 'SAVINGS', 'CASH'])
  const [initialBalance, setInitialBalance] = useState('0')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [currencyId, setCurrencyId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchMetadata = async () => {
      try {
        const resp = await axios.get(`${API_URL}/api/accounts/metadata`)
        const data = resp.data
        if (!mounted) return
        if (Array.isArray(data.accountTypes) && data.accountTypes.length > 0) {
          setAccountTypes(data.accountTypes)
          setType(data.accountTypes[0])
        }
        if (Array.isArray(data.currencies) && data.currencies.length > 0) {
          setCurrencies(data.currencies)
          setCurrencyId(data.currencies[0].id)
        }
      } catch {
      }
    }
    fetchMetadata()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Le nom du compte est obligatoire.')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        initialBalance: Number(initialBalance),
        ...(currencyId ? { currencyId } : {}),
      })
    } catch {
      setError('Impossible de créer le compte pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-card">
      <div>
        <p className="form-card-title">Informations du compte</p>
        <p className="form-card-subtitle">
          Renseignez les détails pour créer votre nouveau compte.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* Nom */}
          <div className="form-field span-2">
            <label className="form-label" htmlFor="account-name">
              Nom du compte
            </label>
            <input
              id="account-name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Compte principal"
              autoComplete="off"
            />
          </div>

          {/* Type */}
          <div className="form-field">
            <label className="form-label" htmlFor="account-type">
              Type
            </label>
            <select
              id="account-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
            >
              {accountTypes.map((t) => (
                <option key={t} value={t}>
                  {accountTypeLabels[t] ?? t}
                </option>
              ))}
            </select>
          </div>

          {/* Devise */}
          <div className="form-field">
            <label className="form-label" htmlFor="account-currency">
              Devise
            </label>
            <select
              id="account-currency"
              className="form-select"
              value={currencyId ?? ''}
              onChange={(e) => setCurrencyId(Number(e.target.value))}
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Solde initial */}
          <div className="form-field span-2">
            <label className="form-label" htmlFor="account-balance">
              Solde initial
            </label>
            <input
              id="account-balance"
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />
          </div>

        </div>

        {/* Erreur inline */}
        {error && (
          <p className="dashboard-error" style={{ marginTop: '16px' }}>
            <i className="bx bx-error-circle" />
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin" />
                Création...
              </>
            ) : (
              <>
                <i className="bx bx-plus" />
                Créer le compte
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateAccountForm