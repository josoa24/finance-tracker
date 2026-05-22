package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransferMoneyCommandHandler {

    private final AccountRepository accountRepository;

    public TransferMoneyCommandHandler(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional
    public void handle(TransferMoneyCommand command) {
        if (command.amount() <= 0) {
            throw new IllegalArgumentException("Le montant du virement doit être strictement supérieur à zéro.");
        }

        if (command.sourceAccountId().equals(command.targetAccountId())) {
            throw new IllegalArgumentException("Impossible d'effectuer un virement sur le même compte.");
        }

        Account sourceAccount = accountRepository.findById(command.sourceAccountId())
                .orElseThrow(() -> new RuntimeException(
                        "Compte source introuvable avec l'ID : " + command.sourceAccountId()));

        Account targetAccount = accountRepository.findById(command.targetAccountId())
                .orElseThrow(() -> new RuntimeException(
                        "Compte destination introuvable avec l'ID : " + command.targetAccountId()));

        if (sourceAccount.getBalance() < command.amount()) {
            throw new IllegalStateException("Solde insuffisant sur le compte source pour effectuer ce virement.");
        }

        sourceAccount.setBalance(sourceAccount.getBalance() - command.amount());
        targetAccount.setBalance(targetAccount.getBalance() + command.amount());

        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);
    }
}