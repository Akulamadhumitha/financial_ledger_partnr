const { getConnection } = require('../db/mysqlClient');
const ledgerRepo = require('../repositories/ledgerRepository');
const txRepo = require('../repositories/transactionRepository');

async function transferFunds({
  sourceAccountId,
  destinationAccountId,
  amount
}) {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Create transaction (PENDING)
    const transactionId = await txRepo.createTransaction(conn, {
      reference: `TX-${Date.now()}`,
      amount
    });

    // 2️⃣ Lock & calculate source balance
    const sourceBalance =
      await ledgerRepo.calculateBalanceForUpdate(conn, sourceAccountId);

    // 3️⃣ Business rule check
    if (sourceBalance < amount) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    // 4️⃣ Debit source
    await ledgerRepo.insertLedgerEntry(conn, {
      accountId: sourceAccountId,
      amount,
      entryType: 'debit',
      transactionId
    });

    // 5️⃣ Credit destination
    await ledgerRepo.insertLedgerEntry(conn, {
      accountId: destinationAccountId,
      amount,
      entryType: 'credit',
      transactionId
    });

    // 6️⃣ Mark transaction completed
    await txRepo.updateTransactionStatus(
      conn,
      transactionId,
      'COMPLETED'
    );

    await conn.commit();
    return { transactionId };

  } catch (err) {
    await conn.rollback();

    // 🔴 Account does not exist (FK violation)
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  transferFunds
};
