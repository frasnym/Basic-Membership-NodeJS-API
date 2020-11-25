const { body } = require('express-validator');

const registerRules = [
    body('full_name').notEmpty().withMessage('ParameterValueRequired'),
    body('current_address').notEmpty().withMessage('ParameterValueRequired'),
    body('email_address').isEmail().withMessage('InvalidEmailAddressFormat'),
    body('phone_number').notEmpty().withMessage('ParameterValueRequired'),
    body('password').notEmpty().withMessage('ParameterValueRequired'),
];

const loginRules = [
    body('email_address').isEmail().withMessage('InvalidEmailAddressFormat'),
    body('password').notEmpty().withMessage('ParameterValueRequired'),
    body('ip_address').isIP().withMessage('InvalidIPAddressFormat'),
];

module.exports = {
    registerRules,
    loginRules,
}