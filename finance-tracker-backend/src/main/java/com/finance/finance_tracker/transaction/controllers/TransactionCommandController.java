package com.finance.finance_tracker.transaction.controllers;

import com.finance.finance_tracker.transaction.dtos.TransactionDTO;
import com.finance.finance_tracker.transaction.services.commands.LogTransactionCommand;
import com.finance.finance_tracker.transaction.services.commands.LogTransactionCommandHandler;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionCommandController {

    private final LogTransactionCommandHandler commandHandler;

    public TransactionCommandController(LogTransactionCommandHandler commandHandler) {
        this.commandHandler = commandHandler;
    }

    @PostMapping
    public ResponseEntity<?> logTransaction(@Valid @RequestBody TransactionDTO dto) {
        try {
            LogTransactionCommand command = new LogTransactionCommand(
                    dto.accountId(),
                    dto.amount(),
                    dto.type(),
                    dto.category(),
                    dto.transactionDate(),
                    dto.note());

            Long transactionId = commandHandler.handle(command);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Transaction enregistrée avec succès !",
                    "transactionId", transactionId));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Une erreur interne est survenue."));
        }
    }
}