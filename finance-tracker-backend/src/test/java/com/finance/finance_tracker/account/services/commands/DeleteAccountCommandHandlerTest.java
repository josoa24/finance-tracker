package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.account.repositories.AccountType;
import com.finance.finance_tracker.transaction.models.Transaction;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import com.finance.finance_tracker.account.models.Currency;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeleteAccountCommandHandlerTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private DeleteAccountCommandHandler deleteAccountCommandHandler;

    @Test
    void should_delete_account_logically_when_it_has_no_transactions() {
        Long accountId = 1L;
        Currency currency = new Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");
        Account fakeAccount = new Account("Compte Épargne", AccountType.SAVINGS, Double.valueOf(1000.0), currency);
        fakeAccount.setId(accountId);
        assertTrue(fakeAccount.isActive(), "Le compte doit être actif au départ.");

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));

        assertFalse(fakeAccount.isActive(), "Le flag active aurait dû passer à false (Soft Delete).");
        verify(accountRepository, times(1)).save(fakeAccount);
        verify(accountRepository, never()).delete(any());
    }

    @Test
    void should_throw_exception_and_block_deletion_when_account_has_existing_transactions() {
        
        Long accountId = 2L;
        Currency currency = new Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");
        Account fakeAccount = new Account("Compte Courant", AccountType.CHECKING, Double.valueOf(500.0), currency);
        fakeAccount.setId(accountId);
        
        fakeAccount.setTransactions(List.of(new Transaction())); 

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));
        });

        assertEquals("Impossible de supprimer un compte possédant des transactions.", exception.getMessage());
        assertTrue(fakeAccount.isActive(), "Le compte doit rester actif si l'opération est bloquée.");
        verify(accountRepository, never()).save(any());   
        verify(accountRepository, never()).delete(any());
    }

    @Test
    void should_throw_exception_when_account_is_already_deleted_logically() {
        Long accountId = 3L;
        Currency currency = new Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");
        Account fakeAccount = new Account("Ancien Compte", AccountType.CASH, Double.valueOf(0.0), currency);
        fakeAccount.setId(accountId);
        fakeAccount.setActive(false); 

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));
        });

        assertEquals("Ce compte a déjà été supprimé.", exception.getMessage());
        verify(accountRepository, never()).save(any());
    }
    
    @Test
    void should_throw_exception_when_account_does_not_exist() {
        Long nonExistentId = 99L;
        when(accountRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deleteAccountCommandHandler.handle(new DeleteAccountCommand(nonExistentId));
        });

        assertEquals("Compte introuvable avec l'ID : " + nonExistentId, exception.getMessage());
        verify(accountRepository, never()).save(any());
        verify(accountRepository, never()).delete(any());
    }
}