package com.finance.finance_tracker.transaction.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.transaction.dtos.TransactionResponseDTO;
import com.finance.finance_tracker.transaction.models.Category;
import com.finance.finance_tracker.transaction.models.Transaction;
import com.finance.finance_tracker.transaction.models.TransactionType;
import com.finance.finance_tracker.transaction.repositories.CategoryRepository;
import com.finance.finance_tracker.transaction.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LogTransactionCommandHandler {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository; // 1. Ajout du repository Category

    public LogTransactionCommandHandler(
            TransactionRepository transactionRepository, 
            AccountRepository accountRepository, 
            CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public TransactionResponseDTO handle(LogTransactionCommand command) {
        if (command.amount() <= 0) {
            throw new IllegalArgumentException("Le montant de la transaction doit être strictement supérieur à zéro.");
        }

        Account account = accountRepository.findById(command.accountId())
                .orElseThrow(() -> new RuntimeException("Compte introuvable avec l'ID : " + command.accountId()));

        if (!account.isActive()) {
            throw new IllegalStateException("Impossible de lier une transaction à un compte supprimé.");
        }

        Category category = categoryRepository.findByNameIgnoreCase(command.category())
            .orElseThrow(() -> new RuntimeException("Catégorie introuvable avec le nom : " + command.category()));

        LocalDateTime transactionDate = command.transactionDate() != null ? command.transactionDate() : LocalDateTime.now();

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
                category, 
            transactionDate,
                command.note(),
                account
        );

        Transaction savedTransaction = transactionRepository.save(transaction);

        boolean limitExceeded = false;
        String warningMessage = null;

        if (command.type() == TransactionType.EXPENSE && category.getMonthlyLimit() != null) {
            LocalDateTime startOfMonth = transactionDate.toLocalDate().withDayOfMonth(1).atStartOfDay();
            
            Double totalSpentThisMonth = transactionRepository.sumAmountByCategoryAndDateAfter(
                category.getId(), 
                TransactionType.EXPENSE,
                startOfMonth
            );

            if (totalSpentThisMonth == null) {
                totalSpentThisMonth = 0.0;
            }

            if (totalSpentThisMonth > category.getMonthlyLimit()) {
                limitExceeded = true;
                warningMessage = "Le plafond mensuel de la catégorie " + category.getName() + " (" + category.getMonthlyLimit() + ") a été dépassé. Total ce mois-ci: " + totalSpentThisMonth;
            }
        }

        return new TransactionResponseDTO(
            savedTransaction.getId(),
            savedTransaction.getAmount(),
            savedTransaction.getType(),
            category.getName(),
            savedTransaction.getTransactionDate(),
            savedTransaction.getNote(),
            limitExceeded,
            warningMessage
        );
    }
}