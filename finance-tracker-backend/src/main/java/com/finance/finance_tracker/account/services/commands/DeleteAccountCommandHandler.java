package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeleteAccountCommandHandler {

    private final AccountRepository accountRepository;

    public DeleteAccountCommandHandler(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional
    public void handle(DeleteAccountCommand command) {
        Account account = accountRepository.findById(command.id())
                .orElseThrow(() -> new RuntimeException("Compte introuvable avec l'ID : " + command.id()));

        if (!account.isActive()) {
            throw new IllegalStateException("Ce compte a déjà été supprimé.");
        }

        if (account.hasTransactions()) {
            throw new IllegalStateException("Impossible de supprimer un compte possédant des transactions.");
        }

        account.setActive(false);
        accountRepository.save(account);
    }
}