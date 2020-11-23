const express = require('express');

require('./db/mongoose')
const { i18next, i18nextMiddleware } = require('./translation');
const authRouter = require('./routers/auth');

const app = express();
app.use(express.json()); // body raw JSON
app.use(i18nextMiddleware.handle(i18next)); // we tell Express to use i18next's middleware
app.use(authRouter);

module.exports = app;