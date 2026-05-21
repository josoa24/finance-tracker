import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Account, TransferMoneyPayload } from '../types'
import { formatCurrency } from '../utils'
import './transfert-money.css'
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
      setError('Sélectionnez deux comptes différents.')
      return
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Le montant doit être supérieur à 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ sourceAccountId, targetAccountId, amount: numericAmount })
    } catch {
      setError('Impossible de réaliser le virement pour le moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="create-account-page">
      <div className="form-card">
                <div>
                  <p className="form-card-title">Détails du virement</p>
                  <p className="form-card-subtitle">
                    Sélectionnez les comptes et renseignez le montant à transférer.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-grid">

                    {/* Depuis */}
                    <div className="form-field">
                      <label className="form-label" htmlFor="source-account">
                        Depuis
                      </label>
                      <select
                        id="source-account"
                        className="form-select"
                        value={sourceAccountId}
                        onChange={(e) => setSourceAccountId(Number(e.target.value))}
                      >
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} — {formatCurrency(account.balance, account.currency)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vers */}
                    <div className="form-field">
                      <label className="form-label" htmlFor="target-account">
                        Vers
                      </label>
                      <select
                        id="target-account"
                        className="form-select"
                        value={targetAccountId}
                        onChange={(e) => setTargetAccountId(Number(e.target.value))}
                      >
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Montant */}
                    <div className="form-field span-2">
                      <label className="form-label" htmlFor="transfer-amount">
                        Montant
                      </label>
                      <input
                        id="transfer-amount"
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      {sourceAccount && (
                        <p className="transfer-hint">
                          <i className="bx bx-info-circle" />
                          Solde disponible&nbsp;:{' '}
                          <strong>{formatCurrency(sourceAccount.balance, sourceAccount.currency)}</strong>
                        </p>
                      )}
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
                      disabled={isSubmitting || accounts.length < 2}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin" />
                          Virement...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-transfer" />
                          Valider le virement
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>
  )
}

export default TransferMoneyModal