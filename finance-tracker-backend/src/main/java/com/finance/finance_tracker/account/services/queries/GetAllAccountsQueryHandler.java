package com.finance.finance_tracker.account.services.queries;

import com.finance.finance_tracker.account.dtos.AccountDTO;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
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
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(a -> a.equals("ROLE_ADMIN"))) {
            return accountRepository.findAll().stream().map(AccountDTO::fromEntity).collect(Collectors.toList());
        }
        String username = auth == null ? null : auth.getName();
        if (username == null) return List.of();
        return accountRepository.findByOwnerUsernameAndActiveTrue(username).stream().map(AccountDTO::fromEntity).collect(Collectors.toList());
    }
}