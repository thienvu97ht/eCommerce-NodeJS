"use strict";

const apikeyModule = require("../models/apikey.module");
const findById = async (key) => {
  const objKey = await apikeyModule
    .findOne({
      key: key,
      status: true,
    })
    .lean();

  return objKey;
};

module.exports = {
  findById,
};
