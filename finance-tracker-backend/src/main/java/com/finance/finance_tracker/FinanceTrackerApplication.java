package com.finance.finance_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
		"com.finance.finance_tracker",
		"com.finance.finance_tracker.account.controllers",
		"com.finance.finance_tracker.transaction.controllers"
})
public class FinanceTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceTrackerApplication.class, args);
	}

}
