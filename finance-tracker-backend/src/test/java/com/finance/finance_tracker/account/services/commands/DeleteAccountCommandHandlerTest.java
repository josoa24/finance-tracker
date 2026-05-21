package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repository.AccountRepository;
import com.finance.finance_tracker.account.repository.AccountType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeleteAccountCommandHandlerTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private DeleteAccountCommandHandler deleteAccountCommandHandler;

    /**
     * SCÉNARIO NOMINAL (Happy Path)
     * Vérifie qu'un compte sans transactions est correctement désactivé (Soft Delete).
     */
    @Test
    void should_delete_account_logically_when_it_has_no_transactions() {
        Long accountId = 1L;
        Account fakeAccount = new Account("Compte Épargne", AccountType.SAVINGS, 1000.0);
        fakeAccount.setId(accountId);
        assertTrue(fakeAccount.isActive(), "Le compte doit être actif au départ.");

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));

        assertFalse(fakeAccount.isActive(), "Le flag active aurait dû passer à false (Soft Delete).");
        verify(accountRepository, times(1)).save(fakeAccount);
        verify(accountRepository, never()).delete(any());
    }

    /**
     * CAS LIMITE (Edge Case - Règle métier stricte)
     * Vérifie qu'on lève une exception et qu'on bloque la suppression si le compte a des transactions.
     */
    @Test
    void should_throw_exception_and_block_deletion_when_account_has_existing_transactions() {
        Long accountId = 2L;
        Account fakeAccount = new Account("Compte Courant", AccountType.CHECKING, 500.0);
        fakeAccount.setId(accountId);
        
        try {
            java.lang.reflect.Field transactionsField = Account.class.getDeclaredField("transactions");
            transactionsField.setAccessible(true);
            transactionsField.set(fakeAccount, List.of(new Object())); 
        } catch (Exception e) {
            fail("Échec de la configuration du mock des transactions : " + e.getMessage());
        }

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));
        });

        assertEquals("Impossible de supprimer un compte possédant des transactions.", exception.getMessage());
        assertTrue(fakeAccount.isActive(), "Le compte doit rester actif si l'opération est bloquée.");
        verify(accountRepository, never()).save(any());   
        verify(accountRepository, never()).delete(any());
    }

    /**
     * CAS LIMITE (Edge Case)
     * Vérifie qu'on lève une erreur si l'utilisateur essaie de supprimer un compte déjà désactivé.
     */
    @Test
    void should_throw_exception_when_account_is_already_deleted_logically() {
        Long accountId = 3L;
        Account fakeAccount = new Account("Ancien Compte", AccountType.CASH, 0.0);
        fakeAccount.setId(accountId);
        fakeAccount.setActive(false); 

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(fakeAccount));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deleteAccountCommandHandler.handle(new DeleteAccountCommand(accountId));
        });

        assertEquals("Ce compte a déjà été supprimé.", exception.getMessage());
        verify(accountRepository, never()).save(any());
    }

    /**
     * CAS LIMITE (Edge Case)
     * Vérifie qu'on lève une exception descriptive si l'ID du compte n'existe pas en base de données.
     */
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