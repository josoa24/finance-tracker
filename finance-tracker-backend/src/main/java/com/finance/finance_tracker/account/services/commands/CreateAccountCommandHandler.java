package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.models.Currency;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.account.repositories.CurrencyRepository;
import com.finance.finance_tracker.auth.repositories.UserRepository;
import com.finance.finance_tracker.auth.models.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateAccountCommandHandler {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;
    private final UserRepository userRepository;

    public CreateAccountCommandHandler(AccountRepository accountRepository, CurrencyRepository currencyRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.currencyRepository = currencyRepository;
        this.userRepository = userRepository;
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

        Account account = new Account(command.name(), command.type(), command.initialBalance(), currency);
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) account.setOwner(user);
        } catch (Exception ignored) {
        }
        return accountRepository.save(account).getId();
    }
}