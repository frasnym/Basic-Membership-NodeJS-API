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

    //? Take all request body, and save it to User Model
    const user = new User(req.body)

    try {
        await user.save()

        res.status(201).send(user)
    } catch (e) {
        res.respMessage.message = e.message;
        res.status(400).send(res.respMessage)
    }
});

module.exports = router