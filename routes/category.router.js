const Router = require('express');
const categoryController = require('./controllers/category.controller');
const router = new Router();

router.get('/categories', categoryController.getAllCategories);
router.post('/create', categoryController.createCategory);
router.post('/edit', categoryController.editCategory);
router.delete('/delete', categoryController.deleteCategory);

module.exports = router;
