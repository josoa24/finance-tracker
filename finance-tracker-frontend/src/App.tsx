import UsersList from './components/UsersList'
import AccountsDashboardPage from './features/accounts/pages/AccountsDashboardPage'
import CreateAccountPage from './features/accounts/pages/CreateAccountPage'
import TransferMoneyPage from './features/accounts/pages/TransferMoneyPage'
import AccountDetailsPage from './features/accounts/pages/AccountDetailsPage'
import PresentationPage from './features/presentation/pages/PresentationPage'

function App() {
  const currentPath = window.location.pathname

  const accountMatch = currentPath.match(/^\/accounts\/(\d+)$/)
  const accountId = accountMatch ? Number(accountMatch[1]) : null

  return (
    <>
      {currentPath === '/' && <PresentationPage />}
      {currentPath === '/dashboard' && <AccountsDashboardPage />}
      {currentPath === '/dashboard/create' && <CreateAccountPage />}
      {currentPath === '/dashboard/transfer' && <TransferMoneyPage />}
      {accountId !== null && <AccountDetailsPage id={accountId} />}
      {currentPath !== '/' && currentPath !== '/dashboard' && currentPath !== '/dashboard/create' && currentPath !== '/dashboard/transfer' && accountId === null && <UsersList />}
    </>
  )
}

export default App
