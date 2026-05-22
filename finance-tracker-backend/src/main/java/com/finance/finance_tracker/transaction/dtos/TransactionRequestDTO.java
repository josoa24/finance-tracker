package com.finance.finance_tracker.transaction.dtos;

import com.finance.finance_tracker.transaction.models.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record TransactionRequestDTO(
    @NotNull(message = "L'ID du compte est obligatoire.")
    Long accountId,

    @NotNull(message = "Le montant est obligatoire.")
    @Positive(message = "Le montant doit être strictement supérieur à zéro.")
    Double amount,

    @NotNull(message = "Le type (INCOME/EXPENSE) est obligatoire.")
    TransactionType type,

    @NotNull(message = "La catégorie est obligatoire.")
    Long categoryId, 

    @NotNull(message = "La date de la transaction est obligatoire.")
    LocalDateTime transactionDate,

    String note
) {}