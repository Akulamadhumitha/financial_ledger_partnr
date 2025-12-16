const express = require('express');
const app = express();
const transferRoutes = require('./routes/transferRoutes');

app.use(express.json());
app.use('/api', transferRoutes);

// Global fallback error (safety net)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Unexpected server error'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
