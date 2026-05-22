package com.finance.finance_tracker.account.dtos;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountType;
import java.time.LocalDateTime;

public record AccountDTO(
    Long id, 
    String name, 
    AccountType type, 
    Double balance,
    LocalDateTime createdAt,
    CurrencyDTO currency
) {
    public static AccountDTO fromEntity(Account account) {
        return new AccountDTO(
            account.getId(), 
            account.getName(), 
            account.getType(), 
            account.getBalance(),
            account.getCreatedAt(),
            account.getCurrency() != null ? CurrencyDTO.fromEntity(account.getCurrency()) : null
        );
    }
}
