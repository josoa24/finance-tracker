package com.finance.finance_tracker.transaction.dtos;

import com.finance.finance_tracker.transaction.models.TransactionType;
import java.time.LocalDateTime;

public record TransactionResponseDTO(
        Long id,
        Double amount,
        TransactionType type,
        String categoryName,
        LocalDateTime transactionDate,
        String note,

        boolean limitExceededWarning,
        String warningMessage) {
}