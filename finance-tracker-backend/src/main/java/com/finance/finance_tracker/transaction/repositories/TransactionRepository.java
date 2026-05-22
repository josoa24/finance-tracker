package com.finance.finance_tracker.transaction.repositories;

import com.finance.finance_tracker.transaction.models.Transaction;
import com.finance.finance_tracker.transaction.models.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountIdOrderByTransactionDateDesc(Long accountId);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.category.id = :categoryId " +
            "AND t.type = :type " +
            "AND t.transactionDate >= :startOfMonth")
    Double sumAmountByCategoryAndDateAfter(
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startOfMonth") LocalDateTime startOfMonth);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.account.id = :accountId " +
            "AND t.type = :type " +
            "AND t.transactionDate >= :start " +
            "AND t.transactionDate < :end")
    Double sumAmountByAccountAndTypeBetween(
            @Param("accountId") Long accountId,
            @Param("type") TransactionType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT t.category.id, t.category.name, t.category.monthlyLimit, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.account.id = :accountId " +
            "AND t.transactionDate >= :start " +
            "AND t.transactionDate < :end " +
            "GROUP BY t.category.id, t.category.name, t.category.monthlyLimit")
    List<Object[]> sumByCategoryForAccountBetween(
            @Param("accountId") Long accountId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}