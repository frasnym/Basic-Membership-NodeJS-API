var jwt = require('jsonwebtoken');

const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) {
            throw new Error('PleaseAuthenticate');
        }

        const Authorization = req.header('Authorization').split(' ');
        const token = Authorization[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        });

        if (!user) {
            throw new Error('PleaseAuthenticate');
        }

        if (user.account_status != 'ACTIVE') {
            throw new Error('AccountInactive');
        }

        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        res.respMessage.message = req.t(e.message);
        return res.status(401).send(res.respMessage);
    }
};

module.exports = auth