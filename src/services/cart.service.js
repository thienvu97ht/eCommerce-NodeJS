'use strict';

const { cart } = require('../models/cart.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');

/*
    Key features: Car Service
    - add product to cart [User]
    - reduce product quantity by one [User]
    - increase product quantity by one [User]
    - get cart [User]
    - delete cart [User]
    - delete cart item [User]
*/

class CartService {
  /// START REPO CART ///
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: 'active' };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;

    const query = { cart_userId: userId, 'cart_products.productId': productId, cart_state: 'active' };
    const updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  /// END REPO CART ///
  static async addToCart({ userId, product = {} }) {
    // check cart tồn tại hay không?
    const userCart = await cart.findOne({ cart_userId: userId });

    if (!userCart) {
      // create cart fot user

      return await CartService.createUserCart({ userId, product });
    }

    // nếu có giỏ hàng nhưng chưa có sản phẩm?
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    // giỏ hàng tồn tại và có sản phẩm này thì update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }
}

module.exports = CartService;
