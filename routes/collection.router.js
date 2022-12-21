const Router = require('express');
const collectionController = require('./controllers/collection.controller');
const router = new Router();

router.get('/collections', collectionController.getAllCollections);
router.get('/:id', collectionController.getCollection);
router.post('/create', collectionController.createCollection);
router.post('/edit', collectionController.editCollection);
router.delete('/delete', collectionController.deleteCollection);

module.exports = router;
