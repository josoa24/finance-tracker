import type { Account } from '../types'
import { accountTypeLabels, formatAccountDate, formatCurrency } from '../utils'

type AccountCardProps = {
  account: Account
}

function AccountCard({ account }: AccountCardProps) {
  return (
    <article className="account-card" role="button" tabIndex={0} onClick={() => (window.location.href = `/accounts/${account.id}`)} onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/accounts/${account.id}` }}>
      <div className="account-card-header">
        <div>
          <h2>{account.name}</h2>
          <span>{accountTypeLabels[account.type]}</span>
        </div>
      </div>
      <p className="account-card-balance">{formatCurrency(account.balance, account.currency)}</p>
      <p className="account-card-date">Cree le {formatAccountDate(account.createdAt)}</p>
    </article>
  )
}

export default AccountCard
