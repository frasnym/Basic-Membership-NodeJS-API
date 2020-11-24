const express = require('express');

const User = require('../models/user');
const { api, errorManipulator } = require('../middleware/api')

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
router.post('/users', api, async (req, res) => {

    const user = new User(req.body) // Take all request body, and save it to User Model

    try {
        await user.save()

        res.respMessage.success = true;
        res.respMessage.data = user;
        res.respMessage.message = req.t('ProcessSuccess');
        res.status(201).send(res.respMessage)
    } catch (e) {
        res.respMessage = errorManipulator(e, req, res.respMessage)
        res.status(400).send(res.respMessage)
    }
});

module.exports = router