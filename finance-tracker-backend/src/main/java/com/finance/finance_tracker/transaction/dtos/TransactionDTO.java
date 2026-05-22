package com.finance.finance_tracker.transaction.dtos;

import com.finance.finance_tracker.transaction.models.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record TransactionDTO(
        @NotNull Long accountId,
        @NotNull @Positive Double amount,
        @NotNull TransactionType type,
        @NotBlank String category,
        @NotNull LocalDateTime transactionDate,
        String note) {
}