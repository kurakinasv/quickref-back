const ApiError = require('../../middleware/error/ApiError');
const { Author } = require('../../models/models');
const {
    checkNotNullStringValueOnCreate,
    checkStringValue,
    isNotNullIdTypeValid,
    checkNotNullStringValue,
} = require('./utils');

class UserController {
    // GET api/author/
    getAllAuthors = async (req, res, next) => {
        try {
            const authors = await Author.findAll();
            res.status(200).json(authors);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // GET api/author/:id
    getAuthor = async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!Number(id)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            const author = await Author.findOne({ where: { id: Number(id) } });

            res.status(200).json(author);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/author/create
    // req.body = { nickname, name, surname, social_media } -- все string
    createAuthor = async (req, res, next) => {
        try {
            const { nickname, name, surname, social_media } = req.body;

            if (!checkNotNullStringValueOnCreate(nickname)) {
                return next(ApiError.badRequest('Некорректый псевдоним'));
            }

            if (
                !checkStringValue(name) |
                !checkStringValue(surname) |
                !checkStringValue(social_media)
            ) {
                return next(ApiError.badRequest('Некорректые данные'));
            }

            const trimmedNick = nickname.trim();

            let trimmedMedia = social_media;
            let isDuplicatedSocialMedia = undefined;

            if (social_media) {
                trimmedMedia = social_media.trim();
                isDuplicatedSocialMedia = await Author.findOne({
                    where: { social_media: trimmedMedia },
                });
            }

            const isExist = await Author.findOne({ where: { nickname: trimmedNick } });
            if (isExist || isDuplicatedSocialMedia) {
                return next(ApiError.badRequest('Этот автор уже существует в базе'));
            }

            const authorName = name ? name.trim() : null;
            const authorSurname = surname ? surname.trim() : null;

            const author = await Author.create({
                nickname: nickname.trim(),
                name: authorName,
                surname: authorSurname,
                social_media: trimmedMedia,
            });

            res.status(200).json(author);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/author/edit
    // req.body = { id: number | string, nickname, name, surname, social_media } -- все остальные string
    editAuthorInfo = async (req, res, next) => {
        try {
            const { id, nickname, name, surname, social_media } = req.body;

            if (!isNotNullIdTypeValid(id)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            if (!checkNotNullStringValue(nickname)) {
                return next(ApiError.badRequest('Некорректный псевдоним'));
            }

            if (
                !checkStringValue(name) |
                !checkStringValue(surname) |
                !checkStringValue(social_media)
            ) {
                return next(ApiError.badRequest('Некорректые данные'));
            }

            const authorToEdit = await Author.findByPk(id);

            if (!authorToEdit) {
                return next(ApiError.badRequest('Автор не найден'));
            }

            // authors must not have the same nicknames and social media links
            const trimmedNick = nickname ? nickname.trim() : nickname;
            if (trimmedNick) {
                const isExist = await Author.findOne({ where: { nickname: trimmedNick } });

                if (isExist) {
                    return next(ApiError.badRequest('Этот автор уже существует в базе'));
                }
            }

            const trimmedMedia = social_media ? social_media.trim() : social_media;
            if (trimmedMedia) {
                const isDuplicatedSocialMedia = await Author.findOne({
                    where: { social_media: trimmedMedia },
                });

                if (isDuplicatedSocialMedia) {
                    return next(ApiError.badRequest('Этот автор уже существует в базе'));
                }
            }

            authorToEdit.nickname = nickname ? trimmedMedia : authorToEdit.nickname;
            authorToEdit.name = name ? name.trim() : authorToEdit.name;
            authorToEdit.surname = surname ? surname.trim() : authorToEdit.surname;
            authorToEdit.social_media = social_media ? trimmedMedia : authorToEdit.social_media;

            await authorToEdit.save();

            res.status(200).json(authorToEdit);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/author/delete
    // req.body = { toDeleteId: number | string }
    deleteAuthor = async (req, res, next) => {
        try {
            const { toDeleteId } = req.body;

            if (!isNotNullIdTypeValid(toDeleteId)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            const toDelete = await Author.findOne({
                where: { id: Number(toDeleteId) },
            });

            if (!toDelete) {
                return next(ApiError.badRequest('Автор не найден'));
            }

            await Author.destroy({ where: { id: Number(toDeleteId) } });

            res.status(200).json({
                message: `Информация об авторе по индексу ${toDeleteId} была удалена`,
            });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new UserController();
