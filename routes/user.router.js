const Router = require('express');
const userController = require('./controllers/user.controller');
const router = new Router();

router.get('/auth', userController.isAuth);
router.post('/login', userController.login);
router.post('/edit', userController.editUser);
router.post('/register', userController.register);

module.exports = router;
