'use strict';

const { SuccessResponse } = require('../core/success.response');
const { listNotiByUser } = require('../services/notification.service');

class NotificationController {
  listNotiByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new list noti by user!',
      metadata: await listNotiByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
