const api = async (req, res, next) => {
    res.respMessage = {
        success: false,
        message: '',
    };
    next();
}

module.exports = api