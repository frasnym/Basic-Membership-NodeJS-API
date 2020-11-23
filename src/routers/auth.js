const express = require('express');

const User = require('../models/user');
const api = require('../middleware/api')

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
        res.status(201).send(res.respMessage)
    } catch (e) {
        for (const [key, value] of Object.entries(e.errors)) {
            res.respMessage.message = res.respMessage.message.concat(`${req.t(value)}: ${key}`);
            break;
        }
        res.status(400).send(res.respMessage)
    }
});

module.exports = router