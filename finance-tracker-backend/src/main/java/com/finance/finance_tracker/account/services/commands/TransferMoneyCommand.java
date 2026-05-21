package com.finance.finance_tracker.account.services.commands;

public record TransferMoneyCommand(
    Long sourceAccountId, 
    Long targetAccountId, 
    Double amount
) {}