package com.finance.finance_tracker.transaction.config;

import com.finance.finance_tracker.transaction.models.Category;
import com.finance.finance_tracker.transaction.repositories.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public TransactionDataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        categoryRepository.saveAll(List.of(
                new Category("SALARY", null),
                new Category("FOOD", null),
                new Category("RENT", null),
                new Category("TRANSPORT", null),
                new Category("LEISURE", null),
                new Category("OTHER", null)
        ));
    }
}