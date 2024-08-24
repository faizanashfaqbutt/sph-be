const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');


const createBlukProduct = async (products) => {
  return Product.insertMany(products);
};

const queryProducts = async (filter, options) => {
  const products = await Product.paginate(filter, options);
  return products;
};

module.exports = {
  createBlukProduct,
  queryProducts,
};
