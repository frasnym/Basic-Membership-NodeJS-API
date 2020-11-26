const express = require('express');

require('./db/mongoose')
const { i18next, i18nextMiddleware } = require('./translation');
const userAuthRouter = require('./routers/user/auth');
const userAccountRouter = require('./routers/user/account');

const app = express();
app.use(express.json()); // body raw JSON
app.use(i18nextMiddleware.handle(i18next)); // we tell Express to use i18next's middleware
app.use(userAuthRouter);
app.use(userAccountRouter);

module.exports = app;