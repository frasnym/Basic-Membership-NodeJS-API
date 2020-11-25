const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const {
    responseTemplate,
    inputBodyValidator,
    errorManipulator
} = require('../middleware/api')

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
router.post('/users', [
    body('full_name').notEmpty().withMessage('ParameterValueRequired'),
    body('current_address').notEmpty().withMessage('ParameterValueRequired'),
    body('email_address').isEmail().withMessage('InvalidEmailAddressFormat'),
    body('phone_number').notEmpty().withMessage('ParameterValueRequired'),
    body('password').notEmpty().withMessage('ParameterValueRequired'),
], responseTemplate, inputBodyValidator, async (req, res) => {

    const user = new User(req.body) // Take all request body, and save it to User Model

    try {
        await user.save()

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        res.status(201).send(res.respMessage)
    } catch (e) {
        res.respMessage = errorManipulator(e, req, res.respMessage)
        res.status(400).send(res.respMessage)
    }
});

/**
 ** Login
 * POST /users/login
 * @param: email_address
 * @param: password
 * @param: ip_address
 */
router.post('/users/login', [
    body('email_address').isEmail().withMessage('InvalidEmailAddressFormat'),
    body('password').notEmpty().withMessage('ParameterValueRequired'),
    body('ip_address').isIP().withMessage('InvalidIPAddressFormat'),
], responseTemplate, inputBodyValidator, async (req, res) => {

    try {
        const user = await User.findbyCredentials(req.body.email, req.body.password)
        // const token = await user.generateAuthToken()

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        res.respMessage.data = user;
        return res.status(200).send(res.respMessage)
    } catch (e) {
        res.respMessage = errorManipulator(e, req, res.respMessage)
        return res.status(404).send(res.respMessage)
    }
});

module.exports = router