'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

// Declare the Schema of the Mongo model
const orderSchema = new Schema(
  {
    order_userId: {
      type: Number,
      required: true,
    },
    order_checkout: {
      type: Object,
      default: {},
    },
    /*
      order_checkout = {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
    */
    order_shipping: {
      type: Object,
      default: {},
    },
    /*
        street,
        city,
        state,
        country
    */
    order_payment: {
      type: Object,
      default: {},
    },
    order_products: {
      type: Array,
      require: true,
    },
    order_trackingNumber: {
      type: String,
    },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
      default: 'pending',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  },
);

// Export the model
module.exports = {
  order: model(DOCUMENT_NAME, orderSchema),
};
