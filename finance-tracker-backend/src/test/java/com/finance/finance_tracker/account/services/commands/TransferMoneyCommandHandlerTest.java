package com.finance.finance_tracker.account.services.commands;

import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.account.repositories.AccountType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferMoneyCommandHandlerTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TransferMoneyCommandHandler transferMoneyCommandHandler;

    @Test
    void should_transfer_money_successfully_when_solde_is_sufficient() {
        com.finance.finance_tracker.account.models.Currency currency = new com.finance.finance_tracker.account.models.Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");

        Account source = new Account("Compte Courant", AccountType.CHECKING, Double.valueOf(500.0), currency);
        source.setId(1L);
        Account target = new Account("Épargne", AccountType.SAVINGS, Double.valueOf(200.0), currency);
        target.setId(2L);

        TransferMoneyCommand command = new TransferMoneyCommand(1L, 2L, 150.0);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(target));

        transferMoneyCommandHandler.handle(command);

        assertEquals(350.0, source.getBalance(), "Le compte source devrait être débité de 150");
        assertEquals(350.0, target.getBalance(), "Le compte de destination devrait être crédité de 150");
        verify(accountRepository, times(1)).save(source);
        verify(accountRepository, times(1)).save(target);
    }

    @Test
    void should_throw_exception_when_source_account_has_insufficient_balance() {
        com.finance.finance_tracker.account.models.Currency currency = new com.finance.finance_tracker.account.models.Currency();
        currency.setId(1L);
        currency.setCode("EUR");
        currency.setSymbol("€");

        Account source = new Account("Compte Courant", AccountType.CHECKING, Double.valueOf(50.0), currency);
        source.setId(1L);
        Account target = new Account("Épargne", AccountType.SAVINGS, Double.valueOf(200.0), currency);
        target.setId(2L);

        TransferMoneyCommand command = new TransferMoneyCommand(1L, 2L, 100.0);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(target));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            transferMoneyCommandHandler.handle(command);
        });

        assertEquals("Solde insuffisant sur le compte source pour effectuer ce virement.", exception.getMessage());
        
        assertEquals(50.0, source.getBalance());
        assertEquals(200.0, target.getBalance());
        verify(accountRepository, never()).save(any());
    }
}