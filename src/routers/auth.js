const express = require('express');

const User = require('../models/user');
const api = require('../middleware/api')
const auth = require('../middleware/auth')
const v = require('../validations');

const router = new express.Router();

/**
 ** Register new User
 * POST /users
 * @param: full_name
 * @param: current_address
 * @param: email_address
 * @param: phone_number
 * @param: password
 */
router.post('/users', v.registerRules, api.setResponseTemplate, api.inputBodyValidator, async (req, res) => {

    const user = new User(req.body) // Take all request body, and save it to User Model

    try {
        await user.save()

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        res.status(201).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage);
        res.status(400).send(res.respMessage);
    }
});

/**
 ** Login
 * POST /users/login
 * @param: email_address
 * @param: password
 * @param: ip_address
 */
router.post('/users/login', v.loginRules, api.setResponseTemplate, api.inputBodyValidator, async (req, res) => {
    try {
        const user = await User.findbyCredentials(req.body.email_address, req.body.password);
        const token = await user.generateAuthToken(req.get('User-Agent'), req.body.ip_address);

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        res.respMessage.data = user;
        res.respMessage.token = token;
        return res.status(200).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage)
        return res.status(404).send(res.respMessage);
    }
});

/**
 ** Logout
 GET /users/logout
 */
router.get('/users/logout', api.setResponseTemplate, auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        return res.status(200).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage)
        return res.status(500).send(res.respMessage);
    }
});

/**
 ** Logout Other
 GET /users/logout_other
 */
router.get('/users/logout_other', api.setResponseTemplate, auth, async (req, res) => {
    try {
        const findIndex = req.user.tokens.findIndex((token_doc) => {
            return token_doc.token === req.token;
        });
        req.user.tokens = req.user.tokens[findIndex];
        await req.user.save();

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        return res.status(200).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage)
        return res.status(500).send(res.respMessage);
    }
});

/**
 ** Logout All
 GET /users/logout_all
 */
router.get('/users/logout_all', api.setResponseTemplate, auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        return res.status(200).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage)
        return res.status(500).send(res.respMessage);
    }
});

module.exports = router