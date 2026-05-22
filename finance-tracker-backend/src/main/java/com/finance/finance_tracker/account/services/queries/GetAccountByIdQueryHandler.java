package com.finance.finance_tracker.account.services.queries;

import com.finance.finance_tracker.account.dtos.AccountDTO;
import com.finance.finance_tracker.account.models.Account;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GetAccountByIdQueryHandler {

    private final AccountRepository accountRepository;

    public GetAccountByIdQueryHandler(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public AccountDTO handle(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte introuvable avec l'ID : " + id));

        if (!account.isActive()) {
            throw new IllegalStateException("Ce compte a été supprimé et ne peut plus être consulté.");
        }

        return AccountDTO.fromEntity(account);
    }
}
