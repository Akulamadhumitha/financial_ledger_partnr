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

    const transactionId = await txRepo.createTransaction(conn, {
  reference: `TX-${Date.now()}`,
  amount
});


    const sourceBalance =
      await ledgerRepo.calculateBalanceForUpdate(conn, sourceAccountId);

    if (sourceBalance < amount) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    await ledgerRepo.insertLedgerEntry(conn, {
      accountId: sourceAccountId,
      amount,
      entryType: 'debit',
      transactionId
    });

    await ledgerRepo.insertLedgerEntry(conn, {
      accountId: destinationAccountId,
      amount,
      entryType: 'credit',
      transactionId
    });

    await txRepo.updateTransactionStatus(
      conn,
      transactionId,
      'COMPLETED'
    );

    await conn.commit();
    return { success: true, transactionId };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  transferFunds
};
