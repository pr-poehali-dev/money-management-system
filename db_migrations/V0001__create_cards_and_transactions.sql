CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(19) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    card_type VARCHAR(10) DEFAULT 'debit' NOT NULL,
    expiry VARCHAR(5),
    cvv VARCHAR(3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id),
    transaction_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    recipient VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

INSERT INTO cards (card_number, balance, card_type, expiry, cvv) 
VALUES ('2202 2032 4554 4491', 0.00, 'debit', '11/26', '648')
ON CONFLICT (card_number) DO NOTHING;