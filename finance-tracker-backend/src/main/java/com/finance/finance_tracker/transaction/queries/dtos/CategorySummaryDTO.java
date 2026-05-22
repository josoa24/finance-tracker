package com.finance.finance_tracker.transaction.queries.dtos;

public record CategorySummaryDTO(
        Long categoryId,
        String categoryName,
        Double spent,
        Double monthlyLimit,
        Double progress
) {}
