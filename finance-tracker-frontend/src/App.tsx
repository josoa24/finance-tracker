import UsersList from './layout/UsersList'
import AccountsDashboardPage from './features/accounts/pages/AccountsDashboardPage'
import CreateAccountPage from './features/accounts/pages/CreateAccountPage'
import TransferMoneyPage from './features/accounts/pages/TransferMoneyPage'
import NewTransactionPage from './features/transaction/pages/NewTransactionPage'
import TransactionHistoryPage from './features/transaction/pages/TransactionHistoryPage'
import AccountDetailsPage from './features/accounts/pages/AccountDetailsPage'
import AccountsListPage from './features/accounts/pages/AccountsListPage'
import PresentationPage from './features/presentation/pages/PresentationPage'

function App() {
  const currentPath = window.location.pathname

  const accountMatch = currentPath.match(/^\/accounts\/(\d+)$/)
  const accountId = accountMatch ? Number(accountMatch[1]) : null

  return (
    <>
      {currentPath === '/' && <PresentationPage />}
      {currentPath === '/dashboard' && <AccountsDashboardPage />}
      {currentPath === '/dashboard/accounts' && <AccountsListPage />}
      {currentPath === '/dashboard/create' && <CreateAccountPage />}
      {currentPath === '/dashboard/transfer' && <TransferMoneyPage />}
      {currentPath === '/transactions/new' && <NewTransactionPage />}
      {currentPath === '/dashboard/history' && <TransactionHistoryPage />}
      {accountId !== null && <AccountDetailsPage id={accountId} />}
      {currentPath !== '/' && currentPath !== '/dashboard' && currentPath !== '/dashboard/create' && currentPath !== '/dashboard/transfer' && accountId === null && <UsersList />}
    </>
  )
}

export default App
