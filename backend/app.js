require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;