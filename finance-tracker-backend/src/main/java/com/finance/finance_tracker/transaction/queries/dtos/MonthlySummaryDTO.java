package com.finance.finance_tracker.transaction.queries.dtos;

import java.util.List;

public record MonthlySummaryDTO(
        Long accountId,
        int year,
        int month,
        Double totalIncome,
        Double totalExpenses,
        Double net,
        List<CategorySummaryDTO> categories
) {}
