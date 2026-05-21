import type { AccountType, Currency } from './types'

export const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: 'Courant',
  SAVINGS: 'Epargne',
  CASH: 'Cash',
}

export function formatCurrency(amount: number, currency?: Currency) {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (!currency) {
    return formattedAmount
  }

  return `${formattedAmount} ${currency.symbol} (${currency.code})`
}

export function formatAccountDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
