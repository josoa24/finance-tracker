package com.finance.finance_tracker.transaction.services.commands;

import com.finance.finance_tracker.transaction.models.TransactionType;
import java.time.LocalDateTime;

public record LogTransactionCommand(
        Long accountId,
        Double amount,
        TransactionType type,
        String category,
        LocalDateTime transactionDate,
        String note) {
}