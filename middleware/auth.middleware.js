const jwt = require('jsonwebtoken');
const ApiError = require('./error/ApiError');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            next(ApiError.unauthorized('Нет авторизации'));
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        next();
    } catch (err) {
        next(ApiError.badRequest(err.message));
    }
};
