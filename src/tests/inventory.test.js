'use strict';

const redisPubsubService = require('../services/redisPubsub.service');

class InventoryServiceTest {
  constructor() {
    redisPubsubService.subscribe('purchase_events', (channel, message) => {
      console.log('Received message:', message);
      InventoryServiceTest.updateInventory(message);
    });
  }

  static updateInventory(message) {
    const { productId, quantity } = JSON.parse(message);
    console.log(`[0001]: Updated inventory for Product ID ${productId}: Quantity ${quantity}`);
  }
}

module.exports = new InventoryServiceTest();
