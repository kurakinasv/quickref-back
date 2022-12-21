const Router = require('express');
const router = new Router();

const userRouter = require('./user.router');
const collectionRouter = require('./collection.router');
const authorRouter = require('./author.router');
const imageRouter = require('./image.router');
const categoryRouter = require('./category.router');

router.use('/user', userRouter);
router.use('/collection', collectionRouter);
router.use('/author', authorRouter);
router.use('/image', imageRouter);
router.use('/category', categoryRouter);

module.exports = router;
