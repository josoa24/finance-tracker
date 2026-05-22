import type { Account } from '../types'

type SidebarProps = {
  accounts: Account[]
}

function Sidebar({ accounts }: SidebarProps) {
  return (
    <aside className="accounts-sidebar">
      <div className="accounts-sidebar-header">
        <h3>Comptes</h3>
        <button className="link-button" onClick={() => (window.location.href = '/transactions/new')}>Faire transaction</button>
      </div>
      <ul>
        {accounts.map((a) => (
          <li key={a.id}>
            <button className="link-button" onClick={() => (window.location.href = `/accounts/${a.id}`)}>
              {a.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
