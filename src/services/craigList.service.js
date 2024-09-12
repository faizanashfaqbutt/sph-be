const scrapJobService = require('../services/scrapJob.service');
const { getCondition } = require('../utils/common');
const puppeteer = require('puppeteer');

async function getCraigListing(interest) {
  try {
   
    console.log(interest?.condition?.toLowerCase(),)
    let craiglistCondition = await getCondition(interest?.condition?.toLowerCase(),"craiglist")
    let zipCode = Number(interest?.zipcode);
    const url = `https://orlando.craigslist.org/search/sss?condition=${craiglistCondition}&max_price=${interest?.max_price}&min_price=${interest?.min_price}&postal=${zipCode}&query=${interest?.keywords}&search_distance=${Number(interest?.radius)}#search=1~gallery~0~0`;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    console.log(url, 'url');
    // Navigate to the URL
    await page.goto(url);
    await page.waitForSelector('.cl-search-result');
    // Call the getData function and await its result
    const scrapeData = await getData(page);

    // Close the browser after all operations are completed
    await browser.close();

    // console.log(scrapeData, 'scrapeData');
    return scrapeData

  } catch (error) {

    console.error(error);
    throw error; // Rethrow the error to be handled elsewhere if needed
  }
}

async function getData(page) {
  const scrapeData = [];

  const searchResults = await page.$$('.cl-search-result');
  let x=0;
  for (const result of searchResults) {
    console.log(x);x++;
    const galleryCard = await result.$('div.gallery-card');
    if (galleryCard) {
      const title = await galleryCard.$eval('a.posting-title > span', (element) =>
        element.textContent.trim()
      );
      const link = await galleryCard.$eval('a.posting-title', (element) => element.href);
      const price = await galleryCard.$eval('span.priceinfo', (element) =>
        element.textContent.trim()
      );
      const imgSrcs = await getImages(link);
      scrapeData.push({
        title,
        link,
        price,
        imgSrc: imgSrcs || '',
      });
    }
  }

  return scrapeData;
}

async function getImages(pageLink) {

  try {
    const browser = await puppeteer.launch({
       headless: true,
       args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      // executablePath: 'google-chrome-stable'
      });
    const page = await browser.newPage();
    await page.goto(pageLink);
    let scrapeImage ;
    const searchResults = await page.$$('.swipe-wrap');
    for (const result of searchResults) {
      const galleryCard = await result.$('div:nth-child(1)');
      if (galleryCard) {
        const imgSrc = await galleryCard.$eval('img', element => element.src);
        scrapeImage = imgSrc
      }
    }
    await browser.close();
    return scrapeImage;
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  getCraigListing
}
