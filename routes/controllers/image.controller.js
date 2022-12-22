const uuid = require('uuid');
const path = require('path');
const { Image } = require('../../models/models');
const ApiError = require('../../middleware/error/ApiError');
const {
    checkStringValue,
    returnTrimOrNull,
    isIdTypeValid,
    isNotNullIdTypeValid,
    checkNotNullStringValue,
} = require('./utils');

class ImageController {
    // GET api/image/images
    getAllImages = async (req, res, next) => {
        try {
            const images = await Image.findAll();
            return res.json(images);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // GET api/image/:id
    getImage = async (req, res, next) => {
        try {
            const { id } = req.params;
            const image = await Image.findOne({ where: { id: Number(id) } });

            return res.json(image);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/image/upload
    // req.body = { date_upload: Date, source?: string }
    uploadImage = async (req, res, next) => {
        try {
            const { date_upload, source } = req.body;

            if (!req.files) {
                return next(ApiError.badRequest('Файлы не были загружены'));
            }

            if (!checkNotNullStringValue(source)) {
                return next(ApiError.badRequest('Невалидная ссылка на источник'));
            }

            // images from the same source must not be upload
            const isImageExist = await Image.findOne({ where: { source } });
            if (isImageExist) {
                return next(ApiError.badRequest('Изображение уже существует'));
            }

            const img = req.files.name;

            const fileName = uuid.v4() + '.jpg';

            img.mv(path.resolve(__dirname, '../..', 'static', fileName));

            // todo add authorId
            const image = await Image.create({ name: fileName, date_upload, source });

            return res.json(image);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/image/edit
    // req.body = { id: number | string, source?: string,
    //              authorId?: number | string, categoryId?: number | string }
    editImageInfo = async (req, res, next) => {
        console.log('id', req.id);
        try {
            const { id, source, authorId, categoryId } = req.body;

            if (!isNotNullIdTypeValid(id)) {
                next(ApiError.badRequest('Невалидный id'));
            }

            const imageToEdit = await Image.findOne({ where: { id: Number(id) } });

            if (!imageToEdit) {
                next(ApiError.badRequest('Изображение не найдено'));
            }

            if (!checkNotNullStringValue(source)) {
                next(ApiError.badRequest('Невалидная ссылка на источник'));
            }

            if (!isIdTypeValid(authorId) || !isIdTypeValid(categoryId)) {
                next(ApiError.badRequest('Невалидные id автора и/или категории'));
            }

            const trimmedSource = source.trim();
            const isSourceExist = await Image.findOne({ where: { source: trimmedSource } });

            if (isSourceExist) {
                next(ApiError.badRequest('Изображение с таким источником уже существует'));
            }

            // todo add check on existing author and category

            imageToEdit.source = source ? trimmedSource : imageToEdit.source;
            imageToEdit.authorId = authorId ? authorId : imageToEdit.authorId;
            imageToEdit.categoryId = categoryId ? categoryId : imageToEdit.categoryId;

            await imageToEdit.save();

            res.status(200).json(imageToEdit);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/image/delete
    // req.body = { id: number | string }
    deleteImage = async (req, res, next) => {
        try {
            const { id: toDeleteId } = req.body;
            if (!isNotNullIdTypeValid(toDeleteId)) {
                next(ApiError.badRequest('Невалидный id'));
            }

            await Image.destroy({ where: { id: Number(toDeleteId) } });

            res.status(200).json({ message: `Изображение по индексу ${toDeleteId} было удалено` });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new ImageController();
