'use strict';

const { SuccessResponse } = require('../core/success.response');
const ProductFactory = require('../services/product.service');
const ProductFactoryV2 = require('../services/product.service.xxx');

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new product success!',
      metadata: await ProductFactoryV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Publish product success!',
      metadata: await ProductFactoryV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'UnPublish product success!',
      metadata: await ProductFactoryV2.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // QUERY //
  /**
   *
   * @desc Get all draft for shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list draft success!',
      metadata: await ProductFactoryV2.findAllDraftForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list publish success!',
      metadata: await ProductFactoryV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list search success!',
      metadata: await ProductFactoryV2.searchProduct(req.params),
    }).send(res);
  };
  // END QUERY //
}

module.exports = new ProductController();
