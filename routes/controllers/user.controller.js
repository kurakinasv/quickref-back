const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../../middleware/error/ApiError');
const { User, Collection } = require('../../models/models');

// .create({params}) - создание сущности
// .findAll() - возвращает все записи
// .findOne({ where: {...} }) - возвращает одну запись

const createToken = (userId, isAdmin) => {
    console.log('createToken', isAdmin);
    const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '48h',
    });
    return token;
};

class UserController {
    isAuth = async (req, res, next) => {
        try {
            console.log('isAuth req.user', req.user);
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

    editUser = async (req, res) => {
        try {
        } catch (err) {}
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });

            if (!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (!email || !isPasswordCorrect) {
                next(ApiError.badRequest('Некорректные данные'));
            }

            const token = createToken(user.id, user.is_admin);

            res.status(201).json({ userId: user.id, token });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    register = async (req, res, next) => {
        try {
            const { email, password, is_admin } = req.body;

            if (!email || !password) {
                next(ApiError.badRequest('Некорректные данные'));
            }

            const isExist = await User.findOne({ where: { email } });

            if (isExist) {
                next(ApiError.badRequest('Такой пользователь уже существует'));
            }

            const hash = await bcrypt.hash(password, 5);

            const user = await User.create({
                email,
                password: hash,
                is_admin,
                created_at: new Date(),
            });

            // favourites -- default collection for each user
            const collection = await Collection.create({ userId: user.id, name: 'Избранное' });

            const token = createToken(user.id, is_admin);

            res.status(201).json({ userId: user.id, collectionId: collection.id, token });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new UserController();
