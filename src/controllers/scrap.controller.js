const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cragListService, productService, fbService, scrapJobService } = require('../services');


const startScrap = catchAsync(async (req, res) => {
  console.log(req.body)
  
  
  const user = req.body;
  let userIntrests = user?.interests?.map(us => {
    if (us.platform === 'Crage List') return us
  });
  let interest = userIntrests[0]
  const currentScrapJob = await scrapJobService.createScrapJob({ status: 'pending', platform: user.platform, searchedFor: interest?.keywords });
  
  if(interest?.platform === 'Crage List' ){
   cragListService.getCraigListing(interest).then(async (scrapeData) => {
    await productService.createBlukProduct(scrapeData);
    await scrapJobService.updateStatus(currentScrapJob._id, 'completed');
  }).catch(async (err) => { 
    await scrapJobService.updateStatus(currentScrapJob._id, 'failed', err);
    console.log(err)
   });
  }

  if(interest?.platform === 'Facebook'){
    fbService.getFbListing(req.body).then(async (data) => {
      console.log(data)
      await productService.createBlukProduct(data);
    await scrapJobService.updateStatus(currentScrapJob._id, 'completed');

    }).catch(async (err) => { 
      await scrapJobService.updateStatus(currentScrapJob._id, 'failed', err);
      console.log(err)
     });
  }

  res.status(200).send({ message: "Scraping started!" });
});




const getScrapJobList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await scrapJobService.queryScrapJobs(filter, options);
  res.send(result);
});

module.exports = {
  startScrap,
  getScrapJobList

};
