async function calculateBalanceForUpdate(conn, accountId) {
  const [rows] = await conn.execute(
    `
    SELECT IFNULL(SUM(
      CASE
        WHEN entry_type = 'credit' THEN amount
        WHEN entry_type = 'debit' THEN -amount
      END
    ), 0) AS balance
    FROM ledger_entries
    WHERE account_id = ?
    FOR UPDATE
    `,
    [accountId]
  );

  return rows[0].balance;
}

async function insertLedgerEntry(conn, entry) {
  const { accountId, amount, entryType, transactionId } = entry;

  await conn.execute(
    `
    INSERT INTO ledger_entries
      (account_id, amount, entry_type, transaction_id)
    VALUES (?, ?, ?, ?)
    `,
    [accountId, amount, entryType, transactionId]
  );
}

module.exports = {
  calculateBalanceForUpdate,
  insertLedgerEntry
};
