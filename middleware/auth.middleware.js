const jwt = require('jsonwebtoken');
const ApiError = require('./error/ApiError');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        next();
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(ApiError.unauthorized('Не передан токен'));
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next(ApiError.unauthorized('Нет авторизации'));
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;

        next();
    } catch (err) {
        next(ApiError.badRequest(err.message));
    }
};
