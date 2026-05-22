import './transaction-list.css'

type AccountCurrency = {
  id?: number
  code?: string
  symbol?: string
}

type TransactionRow = {
  id: number
  transactionDate: string
  category?: string
  categoryName?: string
  note?: string | null
  amount: number
  type: string
  accountName?: string
  accountCurrency?: AccountCurrency
  currency?: AccountCurrency
  currencyCode?: string
  account?: { name?: string }
}

type Props = {
  transactions: TransactionRow[]
}

const CATEGORY_CLASSES: Record<string, string> = {
  SALARY:    'cat--salary',
  FOOD:      'cat--food',
  RENT:      'cat--rent',
  TRANSPORT: 'cat--transport',
  LEISURE:   'cat--leisure',
  OTHER:     'cat--other',
  INCOME:    'cat--salary',
  EXPENSE:   'cat--other',
}

export default function TransactionList({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return <p className="empty-state">Aucune transaction enregistrée pour ce compte.</p>
  }

  const getCurrencyCode = (tx: TransactionRow) =>
    tx.accountCurrency?.code || tx.currency?.code || tx.currencyCode || ''

  const formatDate = (raw: string) => {
    const d = new Date(raw)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (raw: string) => {
    const d = new Date(raw)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="tx-table-wrapper">
      <table className="tx-table">
        <thead>
          <tr>
            <th className="col-date">Date</th>
            <th className="col-account">Compte</th>
            <th className="col-category">Catégorie</th>
            <th className="col-note">Note</th>
            <th className="col-amount">Montant</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isExpense = String(tx.type).toUpperCase() === 'EXPENSE'
            const catKey = (tx.categoryName || tx.category || '').toUpperCase()
            const catClass = CATEGORY_CLASSES[catKey] ?? 'cat--other'

            return (
              <tr key={tx.id} className="tx-row">
                <td className="tx-date">
                  <span className="tx-date-day">{formatDate(tx.transactionDate)}</span>
                  <span className="tx-date-time">{formatTime(tx.transactionDate)}</span>
                </td>
                <td className="tx-account">{tx.accountName || tx.account?.name || '—'}</td>
                <td>
                  <span className={`tx-badge ${catClass}`}>
                    {tx.categoryName || tx.category || '—'}
                  </span>
                </td>
                <td className="tx-note">{tx.note || <span className="tx-empty">—</span>}</td>
                <td className={`tx-amount ${isExpense ? 'tx-amount--expense' : 'tx-amount--income'}`}>
                  {isExpense ? '−' : '+'}
                  {tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' '}{getCurrencyCode(tx)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}