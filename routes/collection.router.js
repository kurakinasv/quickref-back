const Router = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const collectionController = require('./controllers/collection.controller');

const router = new Router();

router.get('/', authMiddleware, collectionController.getAllCollections);
router.get('/:id', authMiddleware, collectionController.getCollection);
router.post('/create', authMiddleware, collectionController.createCollection);
router.post('/edit', authMiddleware, collectionController.editCollection);
router.delete('/delete', authMiddleware, collectionController.deleteCollection);

module.exports = router;
