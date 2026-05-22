package com.finance.finance_tracker.transaction.queries.controllers;

import com.finance.finance_tracker.transaction.queries.dtos.TransactionReadView;
import com.finance.finance_tracker.transaction.queries.services.TransactionQueryHandler;
import com.finance.finance_tracker.transaction.repositories.CategoryRepository;
import com.finance.finance_tracker.transaction.repositories.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.YearMonth;
import com.finance.finance_tracker.transaction.queries.dtos.MonthlySummaryDTO;
import com.finance.finance_tracker.transaction.queries.dtos.CategorySummaryDTO;
import com.finance.finance_tracker.transaction.models.TransactionType;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionQueryController {

    private final TransactionQueryHandler queryHandler;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public TransactionQueryController(TransactionQueryHandler queryHandler, CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.queryHandler = queryHandler;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
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

    @GetMapping("/account/{accountId}/summary/{year}/{month}")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(@PathVariable Long accountId, @PathVariable int year, @PathVariable int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();

        Double income = transactionRepository.sumAmountByAccountAndTypeBetween(accountId, TransactionType.INCOME, start, end);
        Double expenses = transactionRepository.sumAmountByAccountAndTypeBetween(accountId, TransactionType.EXPENSE, start, end);

        income = income == null ? 0.0 : income;
        expenses = expenses == null ? 0.0 : expenses;

        List<Object[]> rows = transactionRepository.sumByCategoryForAccountBetween(accountId, start, end);
        List<CategorySummaryDTO> cats = rows.stream().map(r -> {
            Long catId = (Long) r[0];
            String catName = (String) r[1];
            Double monthlyLimit = (Double) r[2];
            Double spent = (Double) r[3];
            spent = spent == null ? 0.0 : spent;
            Double progress = monthlyLimit == null || monthlyLimit == 0.0 ? null : (spent / monthlyLimit) * 100.0;
            return new CategorySummaryDTO(catId, catName, spent, monthlyLimit, progress);
        }).collect(Collectors.toList());

        MonthlySummaryDTO dto = new MonthlySummaryDTO(accountId, year, month, income, expenses, income - expenses, cats);
        return ResponseEntity.ok(dto);
    }
}