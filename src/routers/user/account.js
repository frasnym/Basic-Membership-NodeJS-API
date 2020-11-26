const express = require('express');

const api = require('../../middleware/api');
const auth = require('../../middleware/auth');
const v = require('../../validations');

const router = new express.Router();

/**
 ** Update authenticated user account
 * PATCH /users
 * @param: full_name
 * @param: current_address
 * @param: email_address
 * @param: phone_number
 * @param: password
 */
router.patch('/users', v.updateAccountRules, api.setResponseTemplate, api.inputBodyValidator, auth, async (req, res) => {

    // Check if only desired parameter provided
    const updates = Object.keys(req.body);
    const allowedUpdates = ['full_name', 'current_address', 'email_address', 'phone_number', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        res.respMessage.message = req.t('InvalidOperation');
        res.status(400).send(res.respMessage);
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.respMessage.success = true;
        res.respMessage.message = req.t('ProcessSuccess');
        res.respMessage.data = req.user;
        res.status(200).send(res.respMessage);
    } catch (e) {
        res.respMessage = api.errorManipulator(e, req, res.respMessage);
        res.status(400).send(res.respMessage);
    }
});

module.exports = router