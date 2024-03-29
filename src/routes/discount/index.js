'ues strict';

const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { authenticationV2 } = require('../../auth/authUtils');
const discountController = require('../../controllers/discount.controller');
const router = express.Router();

// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodesWithProduct));

// authentication
router.use(authenticationV2);
/////////////////

router.get('', asyncHandler(discountController.getAllDiscountCodes));
router.post('', asyncHandler(discountController.createDiscountCode));

module.exports = router;
