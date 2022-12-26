const ApiError = require('../../middleware/error/ApiError');
const { Collection, Image, ImageCollection } = require('../../models/models');
const { defaultCollectionName } = require('./config');
const {
    checkNotNullStringValueOnCreate,
    returnTrimOrNull,
    checkNotNullStringValue,
    isNotNullIdTypeValid,
} = require('./utils');

class CollectionController {
    // GET api/collection/
    getAllCollections = async (req, res, next) => {
        try {
            const { userId } = req.user;

            const collections = await Collection.findAll({ where: { userId } });

            res.status(200).json(collections);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // GET api/collection/:id
    getCollection = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { userId } = req.user;

            const userCollections = await Collection.findAll({ where: { userId } });

            const collectionId = id !== 'fav' ? id : userCollections[0].id;

            const imgCol = await ImageCollection.findAll({ where: { collectionId } });

            console.log('getCollection imgCol', imgCol);

            if (id !== 'fav') {
                const collection = await Collection.findOne({ where: { id: Number(id), userId } });

                res.status(200).json({ collection, imgCol });
            } else {
                res.status(200).json({ ...userCollections[0], imgCol });
            }
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // POST api/collection/create
    // req.body = { name: string, image_amount: number, last_update: string* }
    // *из last_update можно сформировать дату
    createCollection = async (req, res, next) => {
        try {
            const { name, image_amount, last_update } = req.body;
            const { userId } = req.user;

            if (!checkNotNullStringValueOnCreate(name)) {
                return next(ApiError.badRequest('Некорректое название коллекции'));
            }

            const trimmedName = name.trim();

            // one user cannot have multiple collections with the same name
            const isExist = await Collection.findOne({ where: { name: trimmedName } });
            if (isExist) {
                return next(ApiError.badRequest('Такая коллекция уже существует'));
            }

            if (typeof image_amount !== 'number' && image_amount !== undefined) {
                return next(ApiError.badRequest('Некорректное значение количества изображений'));
            }

            const updated = !!Date.parse(last_update) ? last_update : new Date();
            const amount = image_amount === undefined ? 0 : image_amount;

            const collection = await Collection.create({
                name: trimmedName,
                image_amount: amount,
                last_update: updated,
                userId: Number(userId),
            });

            res.status(200).json(collection);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // POST api/collection/edit
    // req.body = { userId:number, id: number | string, name: string, cover_image: string,
    //              image_amount: number, last_update: string*, description: string }
    // *из last_update можно сформировать дату
    editCollection = async (req, res, next) => {
        try {
            const { userId, id, name, cover_image, image_amount, last_update, description } =
                req.body;
            const { userId: tokenUserId } = req.user;

            if (userId !== tokenUserId) {
                return next(ApiError.badRequest('Нет доступа к коллекции'));
            }

            if (!isNotNullIdTypeValid(id)) {
                return next(ApiError.badRequest('Невалидный id коллекции'));
            }

            if (!checkNotNullStringValue(name)) {
                return next(ApiError.badRequest('Некорректное название коллекции'));
            }

            if (typeof image_amount !== 'number' && image_amount !== undefined) {
                return next(ApiError.badRequest('Некорректное значение количества изображений'));
            }

            const trimmedName = name ? name.trim() : name;
            console.log(trimmedName);
            // one user cannot have multiple collections with the same name
            if (name) {
                const isExist = await Collection.findOne({ where: { name: trimmedName, userId } });

                if (isExist) {
                    if (isExist.name === defaultCollectionName) {
                        return next(ApiError.badRequest('Нельзя изменить название этой коллекции'));
                    }

                    return next(ApiError.badRequest('Коллекция с таким именем уже существует'));
                }
            }

            if (cover_image) {
                const coverImage = await Image.findOne({ where: { name: cover_image } });
                if (!coverImage) {
                    return next(ApiError.badRequest('Такого изображения не существует'));
                }
            }

            const toEdit = await Collection.findByPk(Number(id));

            if (!toEdit) {
                return next(ApiError.badRequest('Такой коллекции не существует'));
            }

            toEdit.name = name ? trimmedName : toEdit.name;
            toEdit.image_amount = image_amount === undefined ? toEdit.image_amount : image_amount;
            toEdit.cover_image = cover_image === undefined ? toEdit.cover_image : cover_image;
            toEdit.description = description ? returnTrimOrNull(description) : toEdit.description;
            toEdit.last_update = !!Date.parse(last_update) ? last_update : new Date();

            await toEdit.save();

            res.status(200).json(toEdit);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // DELETE api/collection/delete
    // req.body = { toDeleteId: string | number }
    deleteCollection = async (req, res, next) => {
        try {
            const { toDeleteId, userId } = req.body;
            const { userId: tokenUserId } = req.user;

            if (userId !== tokenUserId) {
                return next(ApiError.badRequest('Нет доступа к коллекции'));
            }

            if (!isNotNullIdTypeValid(toDeleteId)) {
                return next(ApiError.badRequest('Невалидный id коллекции'));
            }

            const toDelete = await Collection.findOne({
                where: { id: Number(toDeleteId), userId },
            });

            if (!toDelete) {
                return next(ApiError.badRequest('Коллекция не найдена'));
            }

            if (toDelete.name === defaultCollectionName) {
                return next(ApiError.badRequest('Эта коллекция не может быть удалена'));
            }

            await Collection.destroy({ where: { id: Number(toDeleteId) } });

            res.status(200).json({ message: `Коллекция по индексу ${toDeleteId} была удалена` });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new CollectionController();
