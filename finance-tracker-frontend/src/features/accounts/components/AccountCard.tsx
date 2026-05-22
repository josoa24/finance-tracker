import { useState } from 'react'
import { API_URL } from '../../../url'
import type { Account } from '../types'

type Props = {
  account: Account
  onDeleteSuccess?: (id: number) => void
}

const TYPE_LABELS: Record<string, string> = {
  courant: 'Courant',
  epargne: 'Épargne',
  investissement: 'Investissement',
}

export default function AccountCard({ account, onDeleteSuccess }: Props) {
  const { id, name, type, balance, currency, hasTransactions, active } = account
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (active === false) return null

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => ({}))
      return data?.message || data?.error || data?.detail || 'Une erreur est survenue.'
    }
    const text = await response.text().catch(() => '')
    return text.trim() || 'Une erreur est survenue.'
  }

  const handleDelete = async () => {
    if (hasTransactions) {
      setError('Impossible de supprimer : ce compte contient des transactions.')
      return
    }
    if (!window.confirm(`Voulez-vous vraiment supprimer le compte "${name}" ?`)) return
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error(await readErrorMessage(response))
      onDeleteSuccess?.(id as number)
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <tr className="account-row">
        <td className="account-name">{name}</td>
        <td>
          <span className={`account-type-badge account-type-badge--${type?.toLowerCase()}`}>
            {TYPE_LABELS[type?.toLowerCase()] ?? type}
          </span>
        </td>
        <td className="account-balance">
          {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="account-currency">{currency?.code ?? 'EUR'}</td>
        <td className="account-action">
          <button
            onClick={handleDelete}
            disabled={isDeleting || !!hasTransactions}
            className={`btn-row-delete ${hasTransactions ? 'btn-row-delete--disabled' : ''}`}
            title={hasTransactions ? 'Ce compte contient des transactions et ne peut pas être supprimé.' : 'Supprimer ce compte'}
          >
            {isDeleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </td>
      </tr>
      {error && (
        <tr className="account-row-error">
          <td colSpan={5}>
            <p className="row-error-message">{error}</p>
          </td>
        </tr>
      )}
    </>
  )
}