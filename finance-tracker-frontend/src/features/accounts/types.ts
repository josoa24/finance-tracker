export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH'

export type Currency = {
  id: number
  code: string
  symbol: string
}

export type Account = {
  id: number
  name: string
  type: AccountType
  balance: number
  createdAt: string
  currency: Currency
}

export type CreateAccountPayload = {
  name: string
  type: AccountType
  initialBalance: number
  currencyId?: number
}

export type TransferMoneyPayload = {
  sourceAccountId: number
  targetAccountId: number
  amount: number
}
