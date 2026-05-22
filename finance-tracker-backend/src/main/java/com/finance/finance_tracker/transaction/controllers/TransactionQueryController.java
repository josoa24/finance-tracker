package com.finance.finance_tracker.transaction.queries.controllers;

import com.finance.finance_tracker.transaction.queries.dtos.TransactionReadView;
import com.finance.finance_tracker.transaction.queries.services.TransactionQueryHandler;
import com.finance.finance_tracker.transaction.models.TransactionType;
import com.finance.finance_tracker.transaction.repositories.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionQueryController {

    private final TransactionQueryHandler queryHandler;
    private final CategoryRepository categoryRepository;

    public TransactionQueryController(TransactionQueryHandler queryHandler, CategoryRepository categoryRepository) {
        this.queryHandler = queryHandler;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionReadView>> getHistory(@PathVariable Long accountId) {
        return ResponseEntity.ok(queryHandler.getTransactionsByAccount(accountId));
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getTypes() {
        return ResponseEntity.ok(Arrays.stream(TransactionType.values()).map(Enum::name).collect(Collectors.toList()));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll().stream().map(category -> category.getName()).collect(Collectors.toList()));
    }
}