const Router = require('express');
const checkAdminMiddleware = require('../middleware/checkAdmin.middleware');
const categoryController = require('./controllers/category.controller');

const router = new Router();

router.get('/', categoryController.getAllCategories);
router.post('/create', checkAdminMiddleware(true), categoryController.createCategory);
router.post('/edit', checkAdminMiddleware(true), categoryController.editCategory);
router.delete('/delete', checkAdminMiddleware(true), categoryController.deleteCategory);

module.exports = router;
