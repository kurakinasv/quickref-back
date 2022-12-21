const uuid = require('uuid');
const path = require('path');
const { Image } = require('../../models/models');
const ApiError = require('../../middleware/error/ApiError');

class ImageController {
    // api/image/images
    getAllImages = async (req, res) => {
        try {
            const images = await Image.findAll();
            return res.json(images);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    getImage = async (req, res) => {
        try {
        } catch (err) {}
    };

    // api/image/upload
    uploadImage = async (req, res, next) => {
        try {
            const { date_upload, source } = req.body;

            if (!req.files) {
                return next(ApiError.badRequest('Файлы не были загружены'));
            }

            const img = req.files.name;

            const fileName = uuid.v4() + '.jpg';

            img.mv(path.resolve(__dirname, '../..', 'static', fileName));

            const image = await Image.create({ name: fileName, date_upload, source });

            return res.json(image);
        } catch (err) {
            next(ApiError.badRequest(err.message));
        }
    };

    editImageInfo = async (req, res) => {
        try {
        } catch (err) {}
    };

    deleteImage = async (req, res) => {
        try {
        } catch (err) {}
    };
}

module.exports = new ImageController();
