const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');
const scrapController = require('../../controllers/scrap.controller');

const router = express.Router();

router
  .route('/')
  .post(   scrapController.startScrap)

  router
  .route('/jobs')
  .get(scrapController.getScrapJobList)
module.exports = router;
