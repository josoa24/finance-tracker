package com.finance.finance_tracker.transaction.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.transaction.models.Transaction;
import com.finance.finance_tracker.transaction.models.TransactionType;
import com.finance.finance_tracker.transaction.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogTransactionCommandHandler {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public LogTransactionCommandHandler(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public Long handle(LogTransactionCommand command) {
        if (command.amount() <= 0) {
            throw new IllegalArgumentException("Le montant de la transaction doit être strictement supérieur à zéro.");
        }

        Account account = accountRepository.findById(command.accountId())
                .orElseThrow(() -> new RuntimeException("Compte introuvable avec l'ID : " + command.accountId()));

        if (!account.isActive()) {
            throw new IllegalStateException("Impossible de lier une transaction à un compte supprimé.");
        }

        double currentBalance = account.getBalance();
        double newBalance;

        if (command.type() == TransactionType.INCOME) {
            newBalance = currentBalance + command.amount();
        } else { 
            newBalance = currentBalance - command.amount();
            if (newBalance < 0) {
                throw new IllegalStateException("Opération refusée : Le solde du compte ne peut pas devenir négatif.");
            }
        }

        account.setBalance(newBalance);
        accountRepository.save(account);

        Transaction transaction = new Transaction(
                command.amount(),
                command.type(),
                command.category(),
                command.transactionDate(),
                command.note(),
                account
        );

        return transactionRepository.save(transaction).getId();
    }
}