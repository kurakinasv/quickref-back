const Router = require('express');
const imageController = require('./controllers/image.controller');
const router = new Router();

router.get('/images', imageController.getAllImages);
router.get('/:id', imageController.getImage);
router.post('/upload', imageController.uploadImage);
router.post('/edit', imageController.editImageInfo);
router.delete('/delete', imageController.deleteImage);

module.exports = router;
