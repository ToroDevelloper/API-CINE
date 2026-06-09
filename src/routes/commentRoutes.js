const express = require('express');
const router = express.Router({ mergeParams: true });
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { protegerRuta } = require('../middlewares/auth');

router.route('/')
    .get(getComments)
    .post(protegerRuta, createComment);

router.route('/:id')
    .delete(protegerRuta, deleteComment);

module.exports = router;
