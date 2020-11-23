const express = require('express');

const authRouter = require('./routers/auth');

const app = express();
app.use(express.json());

app.use(authRouter);

module.exports = app;