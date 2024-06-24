'use strict';

const { SuccessResponse } = require('../core/success.response');
const CommentService = require('../services/comment.service');

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new comment!',
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get comment!',
      metadata: await CommentService.getCommentByParentId(req.query),
    }).send(res);
  };
}

module.exports = new CommentController();
