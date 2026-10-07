const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
// CLIENT_URL can hold several origins separated by commas
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim().replace(/\/$/, ''));
app.use(cors({ origin: origins }));
app.use(express.json());

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
