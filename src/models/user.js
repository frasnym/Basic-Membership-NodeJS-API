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
        required: [true, defaultErrMessage.required],
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
    phone_number: {
        type: String,
        unique: true,
        required: [true, defaultErrMessage.required],
        trim: true,
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
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: [true, defaultErrMessage.required],
        },
        user_agent: {
            type: String,
            required: [true, defaultErrMessage.required],
        },
        ip_address: {
            type: String,
            required: [true, defaultErrMessage.required],
            validate(value) {
                if (!validator.isIP(value)) {
                    throw new Error('InvalidIPAddressFormat')
                }
            }
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

/**
 * Generate token as a sign that user is logged in
 * @param {String} user_agent : User's agent from request headers
 * @param {String} ip_address : User's ip_address from request body
 */
userSchema.methods.generateAuthToken = async function (user_agent, ip_address) {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    const findIndex = user.tokens.findIndex((token_doc) => {
        return token_doc.user_agent === user_agent;
    });

    if (findIndex < 0) { // Index not found = create new
        user.tokens = user.tokens.concat({ token, user_agent, ip_address });
    } else { // Index found = update it
        user.tokens[findIndex] = { token, user_agent, ip_address };
    }
    await user.save();

    return token;
}

/**
 * To lookup user data by it's email & password, preferable for login
 * @param {String} email_address : User's email from request body
 * @param {String} password : User's password from request body
 */
userSchema.statics.findbyCredentials = async (email_address, password) => {

    // const user = await User.findOne({ email_address:email_address })
    const user = await User.findOne({ email_address, account_status: 'ACTIVE' }); // Find user with email_address and account_status

    if (!user) {
        throw new Error('ERRORMIDDLEWARE.LOGIN.');
    }

    const isMatch = await bcrypt.compare(password, user.password) // Check password with hash
    if (!isMatch) {
        throw new Error('ERRORMIDDLEWARE.LOGIN.');
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User