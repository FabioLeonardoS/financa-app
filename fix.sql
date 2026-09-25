ALTER TABLE accounts ADD CONSTRAINT accounts_pluggyId_key UNIQUE ("pluggyId");
ALTER TABLE credit_cards ADD CONSTRAINT credit_cards_pluggyId_key UNIQUE ("pluggyId");
ALTER TABLE transactions ADD CONSTRAINT transactions_pluggyId_key UNIQUE ("pluggyId");
