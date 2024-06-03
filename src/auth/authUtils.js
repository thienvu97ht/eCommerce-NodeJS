'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('./checkAuth');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-rtoken-id',
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, privateKey, {
      expiresIn: '2 days',
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    JWT.verify(accessToken, privateKey, (err, decoded) => {
      if (err) {
        console.error('error verify::', err);
      } else {
        console.log('decoded verify::', decoded);
      }
    });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
    1 - Check userId missing
    2 - Get accessToken
    3 - VerifyToken
    4 - Check user in dbs?
    5 - Check keyStore with this userId?
    6 - OK all => return next()
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid Request');

  // 2.
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found keyStore');

  // 3.
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    console.log('🏆 ~ authentication ~ decodeUser:', decodeUser);
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    console.log('🏆 ~ authentication ~ error:', error);
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
    1 - Check userId missing
    2 - Get accessToken
    3 - VerifyToken
    4 - Check user in dbs?
    5 - Check keyStore with this userId?
    6 - OK all => return next()
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid Request');

  // 2.
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found keyStore');

  // 3.
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');

      req.keyStore = keyStore;
      req.user = decodeUser; // { userId, email }
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User');

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyToken = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  verifyToken,
  authentication,
  authenticationV2,
};
