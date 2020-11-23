const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, 'Why no bacon?'],
        trim: true,
    },
    current_address: {
        type: String,
        required: [true, 'Why no current_address?'],
        trim: true,
    },
    account_status: {
        type: String,
        required: true,
        uppercase: true,
        validate(value) {
            account_status = ['ACTIVE', 'INACTIVE'];
            if (!account_status.includes(value)) {
                throw new Error('Invalid account status')
            }
        },
    },
    email_address: {
        type: String,
        unique: true,
        required: [true, 'Why no email?'],
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        },
    },
    email_address_verify_status: {
        type: String,
        required: true,
        uppercase: true,
        validate(value) {
            account_status = ['UNVERIFIED', 'VERIFIED'];
            if (!account_status.includes(value)) {
                throw new Error('Invalid email_address_verify_status')
            }
        },
    },
    phone_number: {
        type: String,
        unique: true,
        required: [true, 'Why no phone_number?'],
        trim: true,
    },
    phone_number_verify_status: {
        type: String,
        required: true,
        uppercase: true,
        validate(value) {
            account_status = ['UNVERIFIED', 'VERIFIED'];
            if (!account_status.includes(value)) {
                throw new Error('Invalid phone_number_verify_status')
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
        user_agent: {
            type: String,
            required: true,
        },
    }],
}, {
    timestamps: true,
})

const User = mongoose.model('User', userSchema)

module.exports = User