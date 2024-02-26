"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      //step 1: check email exist
      const holderShop = await shopModel.findOne({ email }).lean(); // Lean: convert to plain object
      console.log("🏆 ~ AccessService ~ signUp= ~ holderShop:", holderShop);

      if (holderShop) {
        return {
          code: "xxx",
          message: "Shop already registered!",
        };
      }

      //step 2: create new shop
      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // created privateKey, publicKey
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
        });

        console.log({ publicKey, privateKey }); // save collection KeyStore
      }

      console.log("🏆 ~ AccessService ~ signUp= ~ newShop:", newShop);
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
