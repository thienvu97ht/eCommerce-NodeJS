"ues strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");
const router = express.Router();

// authentication
router.use(authenticationV2);
/////////////////
router.post("", asyncHandler(productController.createProduct));

module.exports = router;
