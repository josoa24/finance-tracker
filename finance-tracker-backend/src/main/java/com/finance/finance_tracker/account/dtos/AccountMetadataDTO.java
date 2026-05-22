package com.finance.finance_tracker.account.dtos;

import java.util.List;

public record AccountMetadataDTO(
    List<String> accountTypes,
    List<CurrencyDTO> currencies
) {}