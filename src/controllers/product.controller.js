"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductFactory = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new product success!",
      metadata: await ProductFactory.createProduct(
        req.body.product_type,
        req.body
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
