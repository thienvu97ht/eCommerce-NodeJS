'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

// Declare the Schema of the Mongo model
const inventorySchema = new Schema(
  {
    inven_productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    inven_location: {
      type: String,
      default: 'unKnow',
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
    inven_reservation: {
      type: Array,
      default: [],
    },
    /*
        cardId: ,
        stock: 1,
        createdOn:
    */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

// Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
};
