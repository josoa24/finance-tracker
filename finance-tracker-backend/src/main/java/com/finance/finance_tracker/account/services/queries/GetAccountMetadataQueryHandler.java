package com.finance.finance_tracker.account.services.queries;

import com.finance.finance_tracker.account.dto.AccountMetadataDTO;
import com.finance.finance_tracker.account.dto.CurrencyDTO;
import com.finance.finance_tracker.account.repository.AccountType;
import com.finance.finance_tracker.account.repository.CurrencyRepository; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GetAccountMetadataQueryHandler {

    private final CurrencyRepository currencyRepository;

    public GetAccountMetadataQueryHandler(CurrencyRepository currencyRepository) {
        this.currencyRepository = currencyRepository;
    }

    @Transactional(readOnly = true)
    public AccountMetadataDTO handle() {
        List<String> types = Arrays.stream(AccountType.values())
                .map(Enum::name)
                .collect(Collectors.toList());

        List<CurrencyDTO> currencies = currencyRepository.findAll().stream()
                .map(CurrencyDTO::fromEntity)
                .collect(Collectors.toList());

        return new AccountMetadataDTO(types, currencies);
    }
}