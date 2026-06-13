require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Seed DB on startup
require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));