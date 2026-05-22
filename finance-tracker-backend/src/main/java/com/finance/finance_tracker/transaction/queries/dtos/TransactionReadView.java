package com.finance.finance_tracker.transaction.queries.dtos;

import com.finance.finance_tracker.transaction.models.TransactionCategory;
import com.finance.finance_tracker.transaction.models.TransactionType;
import java.time.LocalDateTime;

public record TransactionReadView(
    Long id,
    Double amount,
    LocalDateTime transactionDate,
    String note,
    TransactionCategory category,
    TransactionType type
) {}
