import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Account, TransferMoneyPayload } from '../types'
import { formatCurrency } from '../utils'

type TransferMoneyModalProps = {
  accounts: Account[]
  onCancel: () => void
  onSubmit: (payload: TransferMoneyPayload) => Promise<void>
}

function TransferMoneyModal({ accounts, onCancel, onSubmit }: TransferMoneyModalProps) {
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id ?? 0)
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const sourceAccount = useMemo(
    () => accounts.find((account) => account.id === sourceAccountId),
    [accounts, sourceAccountId],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const numericAmount = Number(amount)
    if (sourceAccountId === targetAccountId) {
      setError('Selectionnez deux comptes differents.')
      return
    }

    if (!numericAmount || numericAmount <= 0) {
      setError('Le montant doit etre superieur a 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        sourceAccountId,
        targetAccountId,
        amount: numericAmount,
      })
    } catch {
      setError('Impossible de realiser le virement pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <label>
        Depuis
        <select
          value={sourceAccountId}
          onChange={(event) => setSourceAccountId(Number(event.target.value))}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} - {formatCurrency(account.balance, account.currency)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Vers
        <select
          value={targetAccountId}
          onChange={(event) => setTargetAccountId(Number(event.target.value))}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Montant
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
        />
      </label>

      {sourceAccount && (
        <p className="transfer-hint">Solde disponible : {formatCurrency(sourceAccount.balance, sourceAccount.currency)}</p>
      )}
      {error && <p className="account-form-error">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="primary-button" disabled={isSubmitting || accounts.length < 2}>
          {isSubmitting ? 'Virement...' : 'Valider le virement'}
        </button>
      </div>
    </form>
  )
}

export default TransferMoneyModal
