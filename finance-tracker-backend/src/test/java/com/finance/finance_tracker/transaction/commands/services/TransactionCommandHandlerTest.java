package com.finance.finance_tracker.transaction.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.transaction.models.Transaction;
import com.finance.finance_tracker.transaction.models.TransactionCategory;
import com.finance.finance_tracker.transaction.models.TransactionType;
import com.finance.finance_tracker.transaction.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LogTransactionCommandHandlerTest {

    private TransactionRepository transactionRepository;
    private AccountRepository accountRepository;
    private LogTransactionCommandHandler handler;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        accountRepository = mock(AccountRepository.class);
        handler = new LogTransactionCommandHandler(transactionRepository, accountRepository);
    }

    @Test
    void executeExpense_ShouldUpdateBalanceAndSaveTransaction_WhenBalanceStaysAboveZero() {
        com.finance.finance_tracker.account.models.Currency currency = new com.finance.finance_tracker.account.models.Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");

        Account account = new Account("Compte Courant", com.finance.finance_tracker.account.repositories.AccountType.CHECKING, Double.valueOf(1000.0), currency);
        account.setId(1L);
        account.setActive(true);

        LogTransactionCommand command = new LogTransactionCommand(
                1L, 400.0, TransactionType.EXPENSE, TransactionCategory.FOOD, LocalDateTime.now(), "Courses"
        );

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        
        Transaction fakeSavedTransaction = new Transaction();
        fakeSavedTransaction.setId(99L);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(fakeSavedTransaction);

        Long resultId = handler.handle(command);

        assertEquals(600.0, account.getBalance(), "Le solde du compte aurait dû passer à 600.0");
        assertEquals(99L, resultId);
        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void executeExpense_ShouldThrowException_WhenExpenseBringsBalanceBelowZero() {
        com.finance.finance_tracker.account.models.Currency currency = new com.finance.finance_tracker.account.models.Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");

        Account account = new Account("Compte Étudiant", com.finance.finance_tracker.account.repositories.AccountType.SAVINGS, Double.valueOf(100.0), currency);
        account.setId(1L);
        account.setActive(true);

        LogTransactionCommand command = new LogTransactionCommand(
                1L, 150.0, TransactionType.EXPENSE, TransactionCategory.LEISURE, LocalDateTime.now(), "Cinéma"
        );

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            handler.handle(command);
        });

        assertEquals("Opération refusée : Le solde du compte ne peut pas devenir négatif.", exception.getMessage());
        
        assertEquals(100.0, account.getBalance(), "Le solde du compte ne doit pas avoir bougé.");
        verify(accountRepository, never()).save(any(Account.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}