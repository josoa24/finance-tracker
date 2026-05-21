package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.models.Currency;
import com.finance.finance_tracker.account.repository.AccountRepository;
import com.finance.finance_tracker.account.repository.CurrencyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateAccountCommandHandler {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;

    public CreateAccountCommandHandler(AccountRepository accountRepository, CurrencyRepository currencyRepository) {
        this.accountRepository = accountRepository;
        this.currencyRepository = currencyRepository;
    }

    @Transactional
    public Long handle(CreateAccountCommand command) {
        if (command.initialBalance() < 0) {
            throw new IllegalArgumentException("Le solde initial ne peut pas être inférieur à zéro.");
        }

        if (command.currencyId() == null) {
            throw new IllegalArgumentException("currencyId is required");
        }

        Currency currency = currencyRepository.findById(command.currencyId())
                .orElseThrow(() -> new IllegalArgumentException("Currency not found: " + command.currencyId()));

        Account account = new Account(command.name(), command.type(), command.initialBalance());
        account.setCurrency(currency);

        return accountRepository.save(account).getId();
    }
}