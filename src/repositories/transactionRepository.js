const { randomUUID } = require('crypto');

async function createTransaction(conn, data) {
  const transactionId = randomUUID();

  await conn.execute(
    `
    INSERT INTO transactions
      (id, reference, transaction_type, amount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      transactionId,
      data.reference,
      'TRANSFER',
      data.amount,
      'INR',
      'PENDING'
    ]
  );

  return transactionId;
}

async function updateTransactionStatus(conn, id, status) {
  await conn.execute(
    `
    UPDATE transactions
    SET status = ?
    WHERE id = ?
    `,
    [status, id]
  );
}

module.exports = {
  createTransaction,
  updateTransactionStatus
};
