package com.finance.finance_tracker.auth.config;

import com.finance.finance_tracker.auth.models.Role;
import com.finance.finance_tracker.auth.models.User;
import com.finance.finance_tracker.auth.repositories.UserRepository;
import com.finance.finance_tracker.account.repositories.AccountRepository;
import com.finance.finance_tracker.account.models.Account;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository, AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User("admin", passwordEncoder.encode("admin"), Set.of(Role.ROLE_ADMIN));
            userRepository.save(admin);
        }

        var adminUser = userRepository.findByUsername("admin").orElse(null);
        if (adminUser != null) {
            List<Account> orphanAccounts = accountRepository.findAll().stream().filter(a -> a.getOwner() == null).toList();
            for (Account a : orphanAccounts) {
                a.setOwner(adminUser);
            }
            if (!orphanAccounts.isEmpty()) accountRepository.saveAll(orphanAccounts);
        }
    }
}
