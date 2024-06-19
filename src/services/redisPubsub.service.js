'use strict';

const Redis = require('redis');

class RedisPubSubService {
  constructor() {
    this.subscriber = Redis.createClient({
      url: process.env.REDIS_URL,
    });
    this.publisher = Redis.createClient({
      url: process.env.REDIS_URL,
    });
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  subscribe(channel, callback) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = new RedisPubSubService();
