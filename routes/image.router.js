const Router = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const checkAdminMiddleware = require('../middleware/checkAdmin.middleware');
const imageController = require('./controllers/image.controller');

const router = new Router();

router.get('/images', imageController.getAllImages);
router.get('/:id', imageController.getImage);
router.post('/add', authMiddleware, imageController.addToCollection);
router.delete('/remove', authMiddleware, imageController.removeFromCollection);
router.post('/upload', checkAdminMiddleware(true), imageController.uploadImage);
router.post('/edit', checkAdminMiddleware(true), imageController.editImageInfo);
router.delete('/delete', checkAdminMiddleware(true), imageController.deleteImage);

module.exports = router;
