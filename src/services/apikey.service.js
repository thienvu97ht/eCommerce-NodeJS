"use strict";

const apikeyModel = require("../models/apikey.model");
const findById = async (key) => {
  const objKey = await apikeyModel
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
