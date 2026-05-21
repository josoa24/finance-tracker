package com.finance.finance_tracker.account.controllers;

import com.finance.finance_tracker.account.services.commands.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountCommandController {

    private final CreateAccountCommandHandler createAccountCommandHandler;
    private final DeleteAccountCommandHandler deleteAccountCommandHandler;
    private final TransferMoneyCommandHandler transferMoneyCommandHandler; // <-- AJOUT ICI

    public AccountCommandController(CreateAccountCommandHandler createCommandHandler, 
                                    DeleteAccountCommandHandler deleteCommandHandler,
                                    TransferMoneyCommandHandler transferCommandHandler) { // <-- AJOUT ICI
        this.createAccountCommandHandler = createCommandHandler;
        this.deleteAccountCommandHandler = deleteCommandHandler;
        this.transferMoneyCommandHandler = transferCommandHandler;
    }

    @PostMapping
    public ResponseEntity<Long> createAccount(@RequestBody CreateAccountCommand command) {
        Long accountId = createAccountCommandHandler.handle(command);
        return new ResponseEntity<>(accountId, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        deleteAccountCommandHandler.handle(new DeleteAccountCommand(id));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transferMoney(@RequestBody TransferMoneyCommand command) {
        transferMoneyCommandHandler.handle(command);
        return ResponseEntity.ok().build();
    }
}