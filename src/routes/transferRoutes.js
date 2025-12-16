const express = require('express');
const router = express.Router();
const { transferFunds } = require('../services/transferService');

router.post('/transfer', async (req, res) => {
  try {
    const { sourceAccountId, destinationAccountId, amount } = req.body;

    // 400 — Bad Request (invalid input)
    if (!sourceAccountId || !destinationAccountId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Transfer amount must be greater than zero'
      });
    }

    const result = await transferFunds({
      sourceAccountId,
      destinationAccountId,
      amount
    });

    return res.status(200).json({
      message: 'Transfer successful',
      transactionId: result.transactionId
    });

  } catch (err) {
    // 422 — Business rule violation
    if (err.message === 'INSUFFICIENT_FUNDS') {
      return res.status(422).json({
        error: 'Insufficient funds'
      });
    }

    // 500 — Unknown / system error
    console.error(err);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
