import { useEffect } from 'react'
import AccountsDashboardPage from './features/accounts/pages/AccountsDashboardPage'
import CreateAccountPage from './features/accounts/pages/CreateAccountPage'
import TransferMoneyPage from './features/accounts/pages/TransferMoneyPage'
import NewTransactionPage from './features/transaction/pages/NewTransactionPage'
import TransactionHistoryPage from './features/transaction/pages/TransactionHistoryPage'
import AccountDetailsPage from './features/accounts/pages/AccountDetailsPage'
import AccountsListPage from './features/accounts/pages/AccountsListPage'
import PresentationPage from './features/presentation/pages/PresentationPage'
import CategoryLimitsPage from './features/settings/pages/CategoryLimitsPage'
import AnalyticsPage from './features/analytics/pages/AnalyticsPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { authService } from './utils/authService'

function App() {
  const currentPath = window.location.pathname
  const isAuthenticated = authService.isAuthenticated()

  const accountMatch = currentPath.match(/^\/accounts\/(\d+)$/)
  const accountId = accountMatch ? Number(accountMatch[1]) : null

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/dashboard/accounts',
    '/dashboard/create',
    '/dashboard/transfer',
    '/transactions/new',
    '/dashboard/history',
    '/dashboard/analytics',
    '/settings',
  ]

  const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path)) || accountId !== null

  // Redirect to login if trying to access protected route without auth
  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isProtectedRoute, isAuthenticated])

  // Redirect to dashboard if authenticated and on root or presentation
  useEffect(() => {
    if ((currentPath === '/' || currentPath === '/presentation') && isAuthenticated) {
      window.location.href = '/dashboard'
    }
  }, [currentPath, isAuthenticated])

  return (
    <>
      {currentPath === '/' && !localStorage.getItem('presentation_seen') && <PresentationPage />}
      {currentPath === '/login' && <LoginPage />}
      {currentPath === '/register' && <RegisterPage />}
      {isAuthenticated && currentPath === '/dashboard' && <AccountsDashboardPage />}
      {isAuthenticated && currentPath === '/dashboard/accounts' && <AccountsListPage />}
      {isAuthenticated && currentPath === '/dashboard/create' && <CreateAccountPage />}
      {isAuthenticated && currentPath === '/dashboard/transfer' && <TransferMoneyPage />}
      {isAuthenticated && currentPath === '/transactions/new' && <NewTransactionPage />}
      {isAuthenticated && currentPath === '/dashboard/history' && <TransactionHistoryPage />}
      {isAuthenticated && currentPath === '/dashboard/analytics' && <AnalyticsPage />}
      {isAuthenticated && currentPath === '/settings' && <CategoryLimitsPage />}
      {isAuthenticated && accountId !== null && <AccountDetailsPage id={accountId} />}
    </>
  )
}

export default App
