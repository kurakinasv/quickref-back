const Router = require('express');
const router = new Router();

router.get('/');
router.get('/:id');
router.post('/create');
router.post('/edit');
router.delete('/delete');

module.exports = router;
