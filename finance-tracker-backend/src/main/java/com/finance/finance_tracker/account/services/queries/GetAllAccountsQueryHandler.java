package com.finance.finance_tracker.account.services.queries;

import com.finance.finance_tracker.account.dto.AccountDTO;
import com.finance.finance_tracker.account.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GetAllAccountsQueryHandler {

    private final AccountRepository accountRepository;

    public GetAllAccountsQueryHandler(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountDTO> handle() {
        return accountRepository.findByActiveTrue().stream()
                .map(AccountDTO::fromEntity)
                .collect(Collectors.toList());
    }
}