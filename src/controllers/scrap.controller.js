const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cragListService, productService } = require('../services');


const startScrap = catchAsync(async (req, res) => {
  //console.log(req.body)
  cragListService.getCraigListing(req.body).then(async (data) => {
    await productService.createBlukProduct(data);
  }).catch((err) => { console.log(err) });

  res.status(200).send({ message: "Scraping started!" });
});



module.exports = {
  startScrap,
};
