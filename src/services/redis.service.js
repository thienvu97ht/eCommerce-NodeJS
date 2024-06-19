'use strict';

const redis = require('redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.ping((err, result) => {
  if (err) {
    console.log('Error connecting to Redis::: ', err);
  } else {
    console.log('Connected to Redis');
  }
});

const pExpire = promisify(redisClient.pexpire).bind(redisClient);
const setNXAsync = promisify(redisClient.setnx).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // 3 seconds tạm lock

  for (let i = 0; i < retryTimes.length; i++) {
    // tạo một key, người nào giữ được vào thanh toán
    const result = await setNXAsync(key, expireTime); // nếu key không tồn tại trả về 1, nếu key tồn tại trả về 0
    // result = 1 => key chưa có ai giữ
    // result = 0 => key đã có người giữ
    console.log('result::: ', result);

    if (result === 1) {
      // thao tác với inventory
      const isReservations = await reservationInventory({ productId, quantity, cartId });

      if (isReservations.modifiedCount) {
        await pExpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);

  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
