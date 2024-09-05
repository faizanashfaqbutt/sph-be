const { trendingService } = require('../services');

const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');



const findTrending = catchAsync(async (req, res) => {
    const trendings = await trendingService.findTrending(req.body.link);
    res.send(trendings);
});



const getTrendingSearchHistory = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await trendingService.queryTrendingSearchHistory(filter, options);
    res.send(result);
  });



module.exports = {
    findTrending,
    getTrendingSearchHistory

}