const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const scrapRoute = require('./scrap.route');
const productRoute = require('./product.route');
const trendingRoute = require('./trending.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/scrap',
    route: scrapRoute
  },
  {
    path:'/products',
    route: productRoute,
  },
  {
    path:'/trending',
    route: trendingRoute,
  }
];

const devRoutes = [
  // routes available only in development mode
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
