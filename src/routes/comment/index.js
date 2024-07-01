'ues strict';

const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const commentController = require('../../controllers/comment.controller');
const router = express.Router();

// authentication
router.use(authenticationV2);
/////////////////

router.get('', asyncHandler(commentController.getCommentByParentId));
router.post('', asyncHandler(commentController.createComment));
router.delete('', asyncHandler(commentController.deleteComment));

// QUERY //

module.exports = router;
