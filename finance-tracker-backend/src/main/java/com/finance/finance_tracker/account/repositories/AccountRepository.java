package com.finance.finance_tracker.account.repositories;

import com.finance.finance_tracker.account.models.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByActiveTrue();
}