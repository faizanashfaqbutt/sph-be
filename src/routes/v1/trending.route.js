const express = require('express');
const auth = require('../../middlewares/auth');
const trendingController = require('../../controllers/trending.controller');


const router = express.Router();

router
  .route('/find')
  .post(   trendingController.findTrending)

  router
  .route('/')
  .get(trendingController.getTrendingSearchHistory)

module.exports = router;
