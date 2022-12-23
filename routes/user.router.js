const Router = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const checkAdminMiddleware = require('../middleware/checkAdmin.middleware');
const userController = require('./controllers/user.controller');
const router = new Router();

router.get('/', authMiddleware, userController.getUser);
router.get('/auth', authMiddleware, userController.isAuth);
router.post('/login', userController.login);
router.post('/edit', authMiddleware, userController.editUser);
router.post('/editStatus', checkAdminMiddleware(true), userController.editStatus);
router.post('/register', userController.register);

module.exports = router;
