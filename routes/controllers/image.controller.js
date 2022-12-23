const uuid = require('uuid');
const path = require('path');
const { Image, ImageCollection, Collection } = require('../../models/models');
const ApiError = require('../../middleware/error/ApiError');
const { isIdTypeValid, isNotNullIdTypeValid, checkNotNullStringValue } = require('./utils');

class ImageController {
    // GET api/image/images
    getAllImages = async (req, res, next) => {
        try {
            const images = await Image.findAll();
            res.status(200).json(images);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // GET api/image/:id
    getImage = async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!Number(id)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            const image = await Image.findOne({ where: { id: Number(id) } });

            res.status(200).json(image);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/image/upload
    // req.body = { date_upload: Date, source?: string, categoryId: number, authorId: number }
    uploadImage = async (req, res, next) => {
        try {
            const info = req.body.info;
            const { date_upload, source, categoryId, authorId } = JSON.parse(info);

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

            const img = req.files.files;

            const fileName = uuid.v4() + '.jpg';

            img.mv(path.resolve(__dirname, '../..', 'static', fileName));

            const image = await Image.create({
                name: fileName,
                date_upload,
                source,
                categoryId,
                authorId,
            });

            res.status(200).json(image);
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

            const imageToEdit = await Image.findByPk(Number(id));

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

    addToCollection = async (req, res, next) => {
        try {
            const { id, collectionId } = req.body;
            const { userId } = req.user;

            let imgCol;

            if (!collectionId) {
                const userCollections = await Collection.findAll({ where: { userId } });

                if (await this.isImageExistInCollection(id, userCollections[0].id)) {
                    return res.status(200).json('Изображение уже есть в коллекции');
                }

                if (userCollections) {
                    imgCol = await ImageCollection.create({
                        imageId: id,
                        collectionId: userCollections[0].id,
                    });
                }
            } else {
                if (await this.isImageExistInCollection(id, collectionId)) {
                    return res.status(200).json('Изображение уже есть в коллекции');
                }

                imgCol = await ImageCollection.create({ imageId: id, collectionId });
            }

            res.status(200).json(imgCol);
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
                return next(ApiError.badRequest('Невалидный id'));
            }

            const toDelete = await Image.findByPk(Number(toDeleteId));

            if (!toDelete) {
                return next(ApiError.badRequest('Изображение не найдено'));
            }

            await Image.destroy({ where: { id: Number(toDeleteId) } });

            res.status(200).json({ message: `Изображение по индексу ${toDeleteId} было удалено` });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    isImageExistInCollection = async (imageId, collectionId) => {
        const isExist = await ImageCollection.findOne({
            where: { imageId, collectionId },
        });
        return !!isExist;
    };
}

module.exports = new ImageController();
