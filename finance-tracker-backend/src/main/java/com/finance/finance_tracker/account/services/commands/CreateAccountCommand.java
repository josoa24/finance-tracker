package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.repository.AccountType;

public record CreateAccountCommand(String name, AccountType type, Double initialBalance, Long currencyId) {}