package com.finance.finance_tracker.account.dtos;

import com.finance.finance_tracker.account.models.Currency;

public record CurrencyDTO(Long id, String code, String symbol) {
    public static CurrencyDTO fromEntity(Currency currency) {
        return new CurrencyDTO(currency.getId(), currency.getCode(), currency.getSymbol());
    }
}