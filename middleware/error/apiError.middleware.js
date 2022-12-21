const ApiError = require('./ApiError');

const errorMiddleware = (err, req, res, next) => {
    const { status, message } = err;

    if (err instanceof ApiError) {
        return res.status(status).json({ message });
    }

    return res.status(500).json({ message: "Oops. There's an unhandled error" });
};

module.exports = errorMiddleware;
