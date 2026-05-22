package com.finance.finance_tracker.transaction.queries.services;

import com.finance.finance_tracker.transaction.queries.dtos.TransactionReadView;
import com.finance.finance_tracker.transaction.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true) 
public class TransactionQueryHandler {

    private final TransactionRepository transactionRepository;

    public TransactionQueryHandler(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionReadView> getTransactionsByAccount(Long accountId) {
        return transactionRepository.findByAccountIdOrderByTransactionDateDesc(accountId)
                .stream()
                .map(t -> new TransactionReadView(
                        t.getId(),
                        t.getAmount(),
                        t.getTransactionDate(),
                        t.getNote(),
                        t.getCategory(),
                        t.getType()
                ))
                .collect(Collectors.toList());
    }
}