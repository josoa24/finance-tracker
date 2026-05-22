package com.finance.finance_tracker.transaction.dtos;

public record CategoryLimitResponseDTO(
        Long id,
        String name,
        Double monthlyLimit) {
}