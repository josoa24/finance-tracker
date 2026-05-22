package com.finance.finance_tracker.account.controllers;

import com.finance.finance_tracker.account.dtos.AccountDTO;
import com.finance.finance_tracker.account.services.queries.GetAllAccountsQueryHandler;
import com.finance.finance_tracker.account.services.queries.GetAccountMetadataQueryHandler;
import com.finance.finance_tracker.account.services.queries.GetAccountByIdQueryHandler;
import com.finance.finance_tracker.account.dtos.AccountMetadataDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountQueryController {

    private final GetAllAccountsQueryHandler getAllAccountsQueryHandler;
    private final GetAccountMetadataQueryHandler getAccountMetadataQueryHandler;
    private final GetAccountByIdQueryHandler getAccountByIdQueryHandler;

    public AccountQueryController(GetAllAccountsQueryHandler getAllAccountsQueryHandler, GetAccountMetadataQueryHandler getAccountMetadataQueryHandler, GetAccountByIdQueryHandler getAccountByIdQueryHandler) {
        this.getAllAccountsQueryHandler = getAllAccountsQueryHandler;
        this.getAccountMetadataQueryHandler = getAccountMetadataQueryHandler;
        this.getAccountByIdQueryHandler = getAccountByIdQueryHandler;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable Long id) {
        AccountDTO account = getAccountByIdQueryHandler.handle(id);
        return ResponseEntity.ok(account);
    }

    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        return ResponseEntity.ok(getAllAccountsQueryHandler.handle());
    }

    @GetMapping("/metadata")
    public ResponseEntity<AccountMetadataDTO> getAccountMetadata() {
        return ResponseEntity.ok(getAccountMetadataQueryHandler.handle());
    }
}