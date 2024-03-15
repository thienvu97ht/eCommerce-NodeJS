"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      trim: true,
    },
    product_thumb: {
      type: String,
      trim: true,
    },
    product_description: String,
    product_price: {
      type: Number,
      trim: true,
    },
    product_quantity: {
      type: Number,
      trim: true,
    },
    product_type: {
      type: String,
      trim: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// define the product type = clothing
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collation: "clothes",
    timestamps: true,
  }
);

// define the product type = electronic
const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collation: "electronics",
    timestamps: true,
  }
);

const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collation: "furnitures",
    timestamps: true,
  }
);

// Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("Electronics", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
};
