const ApiError = require('../../middleware/error/ApiError');
const { Category } = require('../../models/models');
const {
    isNotNullIdTypeValid,
    checkNotNullStringValueOnCreate,
    checkNotNullStringValue,
    checkStringValue,
    returnTrimOrNull,
} = require('./utils');

class CategoryController {
    // GET api/category/
    getAllCategories = async (req, res, next) => {
        try {
            const categories = await Category.findAll();
            res.status(200).json(categories);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/category/create
    // req.body = {category_name, category_description} -- все string
    createCategory = async (req, res, next) => {
        try {
            const { category_name, category_description } = req.body;

            if (!checkNotNullStringValueOnCreate(category_name)) {
                return next(ApiError.badRequest('Некорректное название категории'));
            }

            const trimmedName = category_name.trim();
            const isExist = await Category.findOne({ where: { category_name: trimmedName } });

            if (isExist) {
                return next(ApiError.badRequest('Такая категория уже существует'));
            }

            const description = category_description ? String(category_description).trim() : null;

            const category = await Category.create({
                category_name: trimmedName,
                category_description: description,
            });

            res.status(200).json(category);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/category/edit
    // req.body = {id: number | string, category_name, category_description} -- остальные string
    editCategory = async (req, res, next) => {
        try {
            const { id, category_name, category_description } = req.body;

            if (!isNotNullIdTypeValid(id)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            if (!checkNotNullStringValue(category_name)) {
                return next(ApiError.badRequest('Некорректное название категории'));
            }

            if (!checkStringValue(category_description)) {
                return next(ApiError.badRequest('Некорректное описание категории'));
            }

            const trimmedName = category_name ? category_name.trim() : category_name;

            if (category_name) {
                const isExist = await Category.findOne({ where: { category_name: trimmedName } });

                if (isExist) {
                    return next(ApiError.badRequest('Категория с таким именем уже существует'));
                }
            }

            const toEdit = await Category.findByPk(Number(id));

            if (!toEdit) {
                return next(ApiError.badRequest('Такой категории не существует'));
            }

            toEdit.category_name = category_name ? trimmedName : toEdit.category_name;
            toEdit.category_description = category_description
                ? returnTrimOrNull(category_description)
                : toEdit.category_description;

            await toEdit.save();

            res.status(200).json(toEdit);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    // [admin] POST api/category/delete
    // req.body = { toDeleteId: string | number }
    deleteCategory = async (req, res, next) => {
        try {
            const { toDeleteId } = req.body;

            if (!isNotNullIdTypeValid(toDeleteId)) {
                return next(ApiError.badRequest('Невалидный id'));
            }

            const toDelete = await Category.findByPk(Number(toDeleteId));

            if (!toDelete) {
                return next(ApiError.badRequest('Категория не найдена'));
            }

            await Category.destroy({ where: { id: Number(toDeleteId) } });

            res.status(200).json({ message: `Категория по индексу ${toDeleteId} была удалена` });
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };
}

module.exports = new CategoryController();
