const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../../middleware/error/ApiError');
const { User, Collection } = require('../../models/models');
const { defaultCollectionName } = require('./config');
const {
    checkNotNullStringValue,
    checkStringValue,
    returnTrimOrNull,
    isNotNullIdTypeValid,
} = require('./utils');

const createToken = (userId, isAdmin) => {
    const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '48h',
    });
    return token;
};

class UserController {
    // GET /api/user/
    getUser = async (req, res, next) => {
        try {
            const { userId } = req.user;

            if (!userId) {
                next(ApiError.unauthorized('Пользователь с таким id не найден'));
            }

            const user = await User.findByPk(userId);

            if (!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }

            res.status(201).json(user);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // GET /api/user/auth
    isAuth = async (req, res, next) => {
        try {
            const { userId, isAdmin } = req.user;

            if (!userId) {
                next(ApiError.unauthorized('Пользователь с таким id не найден'));
            }

            const user = await User.findOne({ where: { id: userId } });

            if (!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }

            const token = createToken(userId, isAdmin);
            res.status(201).json({ userId, token });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // POST /api/user/edit
    // req.body = { id, email, name, surname, usename } -- id: number | string, остальное string
    // @returns user object if successfully edited
    editUser = async (req, res, next) => {
        try {
            // todo maybe add id
            const { id, email, name, surname, username, about } = req.body;

            if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
                return next(ApiError.badRequest('Некорректный id'));
            }

            const user = await User.findByPk(Number(id));

            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (!checkNotNullStringValue(email)) {
                return next(ApiError.badRequest('Почта не может быть пустой'));
            }

            if (!checkNotNullStringValue(username) && user.username) {
                return next(ApiError.badRequest('Нельзя удалять юзернейм'));
            }

            if (!checkStringValue(name) || !checkStringValue(surname) || !checkStringValue(about)) {
                return next(ApiError.badRequest('Некорректно введенные данные'));
            }

            // (handled undefined values must not be rewritten)
            user.email = email ? email.trim() : user.email;
            user.name = name !== undefined ? returnTrimOrNull(name) : user.name;
            user.surname = surname !== undefined ? returnTrimOrNull(surname) : user.surname;
            user.username = username ? username.trim() : user.username;
            user.about = about !== undefined ? returnTrimOrNull(about) : user.about;

            // update nessesary info
            await user.save();

            res.status(200).json(user);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST /api/user/editStatus
    editStatus = async (req, res, next) => {
        try {
            const { id, is_admin } = req.body;

            if (!isNotNullIdTypeValid(id)) {
                next(ApiError.badRequest('Некорректный id'));
            }

            const user = await User.findOne({ where: { id: Number(id) } });

            if (!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }

            if (typeof is_admin !== 'boolean') {
                next(ApiError.badRequest('Некорректный тип is_admin'));
            }

            user.is_admin = is_admin === undefined ? user.is_admin : is_admin;

            await user.save();

            res.status(200).json(user);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // POST /api/user/login
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // remove leading and trailing white space
            const trimmedEmail = email ? email.trim() : email;

            const user = await User.findOne({ where: { email: trimmedEmail } });

            if (!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (!email || !isPasswordCorrect) {
                next(ApiError.badRequest('Некорректные данные'));
            }

            const token = createToken(user.id, user.is_admin);

            res.status(201).json({ ...user, userId: user.id, token });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // POST /api/user/register
    register = async (req, res, next) => {
        try {
            const { email, password, is_admin } = req.body;

            if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
                next(ApiError.badRequest('Некорректные данные'));
            }

            const trimmedEmail = email.trim();

            const isExist = await User.findOne({ where: { email: trimmedEmail } });

            if (isExist) {
                next(ApiError.badRequest('Такой пользователь уже существует'));
            }

            const hash = await bcrypt.hash(password, 5);

            const user = await User.create({
                email: trimmedEmail,
                password: hash,
                is_admin: !!is_admin,
                created_at: new Date(),
            });

            // favourites -- default collection for each user
            const collection = await Collection.create({
                userId: user.id,
                name: defaultCollectionName,
            });

            const token = createToken(user.id, is_admin);

            res.status(201).json({ ...user, userId: user.id, collectionId: collection.id, token });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new UserController();
