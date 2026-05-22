package com.finance.finance_tracker.transaction.models;

import com.finance.finance_tracker.account.models.Account;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionCategory category;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(length = 500)
    private String note; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    public Transaction() {}

    public Transaction(Double amount, TransactionType type, TransactionCategory category, 
                       LocalDateTime transactionDate, String note, Account account) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.transactionDate = transactionDate != null ? transactionDate : LocalDateTime.now();
        this.note = note;
        this.account = account;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public TransactionCategory getCategory() { return category; }
    public void setCategory(TransactionCategory category) { this.category = category; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
}