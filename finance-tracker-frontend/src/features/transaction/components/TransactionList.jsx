import React from 'react';

export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <p className="empty-state">Aucune transaction enregistrée pour ce compte.</p>;
  }

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
              <th>Date</th>
              <th>Compte</th>
              <th>Devise</th>
              <th>Catégorie</th>
              <th>Note</th>
              <th>Montant</th>
            </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
              <tr key={tx.id} className={`tx-row ${tx.type.toLowerCase()}`}>
              <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
              <td className="tx-account">{tx.accountName || (tx.account && tx.account.name) || '-'}</td>
              <td className="tx-currency">{tx.accountCurrency?.code || tx.currency?.code || tx.currencyCode || '-'}</td>
              <td><span className="badge-category">{tx.category}</span></td>
              <td className="tx-note">{tx.note || '-'}</td>
              <td className="tx-amount">
                {tx.type === 'EXPENSE' ? '-' : '+'} {tx.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}