const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const defaultErrMessage = require('../db/mongoose_message');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, defaultErrMessage.required],
        trim: true,
    },
    current_address: {
        type: String,
        required: [true, defaultErrMessage.required],
        trim: true,
    },
    account_status: {
        type: String,
        required: true,
        uppercase: true,
        default: 'ACTIVE',
        validate(value) {
            account_status = ['ACTIVE', 'INACTIVE'];
            if (!account_status.includes(value)) {
                throw new Error('Invalid account status')
            }
        },
    },
    email_address: {
        type: String,
        unique: [true, 'asd'],
        required: [true, defaultErrMessage.required],
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('InvalidEmailAddressFormat')
            }
        },
    },
    email_address_verify_status: {
        type: String,
        required: true,
        uppercase: true,
        default: 'UNVERIFIED',
        validate(value) {
            account_status = ['UNVERIFIED', 'VERIFIED'];
            if (!account_status.includes(value)) {
                throw new Error('StatusValueNotIdentified')
            }
        },
    },
    phone_number: {
        type: String,
        unique: true,
        required: [true, defaultErrMessage.required],
        trim: true,
        validate(value) {
            if (!value.startsWith('62')) {
                throw new Error('InvalidPhoneNumberFormat')
            }
        },
    },
    phone_number_verify_status: {
        type: String,
        required: [true, defaultErrMessage.required],
        uppercase: true,
        default: 'UNVERIFIED',
        validate(value) {
            account_status = ['UNVERIFIED', 'VERIFIED'];
            if (!account_status.includes(value)) {
                throw new Error('StatusValueNotIdentified')
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

userSchema.post('save', function (error, doc, next) {

    /**
     * Uniqueness in Mongoose is not a validation parameter (like required); it tells Mongoose to create a unique index in MongoDB for that field
     * You have to handle these errors yourself if you want to create custom error messages. The Mongoose documentation ("Error Handling Middleware") provides you with an example on how to create custom error handling:
     * https://mongoosejs.com/docs/middleware.html#error-handling-middleware
     */
    if (error.name === 'MongoError' && error.code === 11000) {
        // console.log(error)
        // console.log(Object.keys(error.keyPattern).toString())
        next(new Error(`ERRORMIDDLEWARE.DUPLICATE.${Object.keys(error.keyPattern).toString()}`));
    } else {
        next();
    }
});

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('phone_number')) { // Check if column is modified
        user.phone_number = `(${user.phone_number.substr(0, 2)})${user.phone_number.substr(2)}`; // Insert brackets "()" on phone code
    }

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); // Done with the function
});

/**
 ** Hide credentials data on API response
 */
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

const User = mongoose.model('User', userSchema)

module.exports = User