import type { Account } from '../types'

type SidebarProps = {
  accounts: Account[]
}

function Sidebar({ accounts }: SidebarProps) {
  return (
    <aside className="accounts-sidebar">
      <h3>Comptes</h3>
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
