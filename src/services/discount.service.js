'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const discountModel = require('../models/discount.model');
const { findAllDiscountCodesUnSelect, checkDiscountExists } = require('../models/repositories/discount.repo');
const { findAllProducts } = require('../models/repositories/product.repo');
const { convertToObjectIdMongodb } = require('../utils');

/*
    Discount Service
    1 - Generate Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User | Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop | Admin]
    6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
    } = payload;

    // kiem tra
    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError('Discount code has expired!');
    // }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be less than end date');
    }

    // create index for discount code
    const foundDiscountCode = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscountCode && foundDiscountCode.discount_is_active === true) {
      throw new BadRequestError('Discount exists!');
    }
    console.log('🏆 ~ DiscountService ~ createDiscountCode ~ foundDiscountCode:', foundDiscountCode);

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
    });
    console.log('🏆 ~ DiscountService ~ createDiscountCode ~ newDiscount:', newDiscount);

    return newDiscount;
  }

  static async updateDiscountCode() {}

  /*
        Get discount codes
   */

  static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || foundDiscount.discount_is_active === false) {
      throw new NotFoundError('Discount not exists!');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === 'all') {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    if (discount_applies_to === 'specific') {
      // get the products ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    return products;
  }

  /*
        Get all discount code of shop
   */

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discountModel,
    });

    return discounts;
  }

  /*
      Apply discount code 
   */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError('Discount not exists!');

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_max_uses_per_user,
      discount_start_date,
      discount_end_date,
      discount_type,
      discount_value,
    } = foundDiscount;
    console.log('🏆 ~ DiscountService ~ getDiscountAmount ~ discount_is_active:', discount_is_active);

    if (!discount_is_active) throw new NotFoundError('Discount expired!');
    if (!discount_max_uses) throw new NotFoundError('Discount are out!');

    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new NotFoundError('Discount expired!');
    }

    // check xem có set giá trị tối thiểu hay không
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}!`);
      }
    }

    console.log('🏆 ~ DiscountService ~ getDiscountAmount ~ totalOrder:', totalOrder);
    if (discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find((user) => user.userId === userId);
      if (userUsedDiscount) {
      }
    }

    // check xem discount này là fixed_amount hay percentage
    const amount = discount_type === 'fixed_amount' ? discount_value : (discount_value / 100) * totalOrder;

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.deleteOne({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  /*
      Cancel Discount Code ()
  */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError('Discount not exists!');

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: {
          userId,
        },
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
