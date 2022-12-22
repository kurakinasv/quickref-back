const Router = require('express');
const checkAdminMiddleware = require('../middleware/checkAdmin.middleware');
const authorController = require('./controllers/author.controller');

const router = new Router();

router.get('/', authorController.getAllAuthors);
router.get('/:id', authorController.getAuthor);
router.post('/create', checkAdminMiddleware(true), authorController.createAuthor);
router.post('/edit', checkAdminMiddleware(true), authorController.editAuthorInfo);
router.delete('/delete', checkAdminMiddleware(true), authorController.deleteAuthor);

module.exports = router;
