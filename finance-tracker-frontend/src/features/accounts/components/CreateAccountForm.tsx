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
    return () => {
      mounted = false
    }
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
      setError('Impossible de creer le compte pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <label>
        Nom du compte
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Compte principal"
        />
      </label>

      <label>
        Type
        <select value={type} onChange={(event) => setType(event.target.value as AccountType)}>
          {accountTypes.map((t) => (
            <option key={t} value={t}>
              {accountTypeLabels[t] ?? t}
            </option>
          ))}
        </select>
      </label>

      <label>
        Devise
        <select value={currencyId ?? ''} onChange={(event) => setCurrencyId(Number(event.target.value))}>
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.symbol} ({c.code})
            </option>
          ))}
        </select>
      </label>

      <label>
        Solde initial
        <input
          type="number"
          min="0"
          step="0.01"
          value={initialBalance}
          onChange={(event) => setInitialBalance(event.target.value)}
        />
      </label>

      {error && <p className="account-form-error">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creation...' : 'Creer le compte'}
        </button>
      </div>
    </form>
  )
}

export default CreateAccountForm
