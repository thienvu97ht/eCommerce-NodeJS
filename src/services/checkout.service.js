'use strict';

const { BadRequestError } = require('../core/error.response');
const { order } = require('../models/order.model');
const { findCartById } = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');

class CheckoutService {
  // login and without login

  /*
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId,
                        }
                    ]
                },
                {
                    shopId,
                    shop_discounts: [
                        {
                            "shopId",
                            "discountId"
                            "codeId"
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId,
                        }
                    ]
                }
            ]
        }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // check cartId tồn tại không?
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError('Cart does note exists!');

    const checkout_order = {
      totalPrice: 0, // tổng tiền hàng
      feeShip: 0, // phí vận chuyển
      totalDiscount: 0, // tổng tiền discount
      totalCheckout: 0, // tổng thanh toán
    };

    const shop_order_ids_new = [];

    // tính tổng tiền bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];
      // check product available
      const checkProductServer = await checkProductByServer(item_products);

      if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!');

      // tổng tiền đơn hàng
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // tổng tiền trước khi xử lý
      checkout_order.totalPrice = +checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tiền trước khi giảm giá
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      // nếu shop_discounts tồn tại > 0, check xem có hợp lệ hay không
      if (shop_discounts.length > 0) {
        // gỉa sử chỉ có một discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        // tổng cộng discount giảm giá
        checkout_order.totalDiscount += discount;

        // nếu tiền giảm giá lớn hơn 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }

        // tổng thanh toán cuối cùng
        checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
        shop_order_ids_new.push(itemCheckout);
      }
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // order

  static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
    const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });

    // check lại một lần nữa xem vượt tồn kho hay không?
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log('🏆 ~ CheckoutService ~ orderByUser ~ products:', products);

    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];

      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);

      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // check nếu có một sản phẩm hết hàng trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError('Một số sản phẩm đã được cập nhật, vui lòng quay lại giỏ hàng!');
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // nếu order thành công thì remove product trong giỏ hàng

    if (newOrder) {
      // remove product in my cart
    }

    return newOrder;
  }

  /*
      1> Query Orders [Users]
  */
  static async getOrdersByUser() {}

  /*
      2> Query Order Using Id [Users]
  */
  static async getOneOrderByUser() {}

  /*
      3> Cancel Order [Users]
  */
  static async cancelOrderByUser() {}

  /*
      4> Update Order Status [Shop | Admin]
  */
  static async updateOrdersStatusByShop() {}
}

module.exports = CheckoutService;
