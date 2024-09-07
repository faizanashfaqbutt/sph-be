const axios = require('axios');
const puppeteer = require('puppeteer');
const TrendApplied = require('../models/trendApplied.model');

const findTrending = async (link) => {

    const data = await getDataFromAmazonLink(link);
    console.log(data);
    // const dummyData = {
    //     "rating": [4, 1],
    //     "bought_in_previous_month": [500, 50]
    // }
    const response = await axios.post('http://localhost:3003/predict', {
        "rating": data.rating,
        "bought_in_previous_month": data.bought_in_previous_month
    })
    console.log(response.data);
    const dataToSave ={
        isTrending: response.data.predictions[0],
        rating: data.rating[0],
        bought: data.bought_in_previous_month[0],
        title: data.title,
        imgsrc: data.imgsrc,
    }
    await TrendApplied.create(dataToSave);
    return dataToSave;

}


getDataFromAmazonLink = async (link) => {


    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
            '--start-maximized' // you can also use '--start-fb ullscreen'
        ]
    });
    const page = await browser.newPage();

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        //'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    ];

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    await page.setUserAgent(randomUserAgent);


    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
    let rate, bought, imgsrc, title;
    await page.waitForSelector('#acrPopover');
    try {
        const ratingel = await page.$('.reviewCountTextLinkedHistogram.noUnderline');
         rate = await ratingel.$eval('span>a>span.a-size-base.a-color-base', element => element.innerText);
        bought = await page.$eval('#social-proofing-faceout-title-tk_bought', element => element.innerText);
        bought = bought.toLowerCase().split(' ')[0]?.replace('+','').replace('k','000')
        imgsrc = await page.$eval('#landingImage', element => element.src);
        title = await page.$eval('#title', element => element.innerText);
        console.log(rate,bought)
    } catch (error) {
        console.log(error);
        throw new Error('Error in scraping');
    }
    // console.log(rating);
    return {
        rating: [parseFloat(rate)],
        bought_in_previous_month: [parseInt(bought)],
        imgsrc,
        title
    }
}


const queryTrendingSearchHistory = async (filter, options) => {
    const products = await TrendApplied.paginate(filter, options);
    return products;
  };

  

module.exports = {
    findTrending,
    queryTrendingSearchHistory
}