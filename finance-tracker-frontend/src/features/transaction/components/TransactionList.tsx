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
  account?: {
    name?: string
  }
}

type Props = {
  transactions: TransactionRow[]
}

export default function TransactionList({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return <p className="empty-state">Aucune transaction enregistrée pour ce compte.</p>
  }

  const formatAmount = (tx: TransactionRow) => {
    const amountPrefix = String(tx.type).toUpperCase() === 'EXPENSE' ? '-' : '+'
    const currencyLabel = tx.accountCurrency?.code || tx.currency?.code || tx.currencyCode || ''
    return `${amountPrefix}${tx.amount.toLocaleString()}${currencyLabel}`
  }

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Compte</th>
            <th>Catégorie</th>
            <th>Note</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className={`tx-row ${String(tx.type).toLowerCase()}`}>
              <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
              <td className="tx-account">{tx.accountName || tx.account?.name || '-'}</td>
              <td><span className="badge-category">{tx.categoryName || tx.category || '-'}</span></td>
              <td className="tx-note">{tx.note || '-'}</td>
              <td className="tx-amount">{formatAmount(tx)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
