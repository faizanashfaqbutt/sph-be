
const puppeteer = require('puppeteer');


const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');

console.log('hello world')

function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => records.push(row))
            .on('end', () => resolve(records))
            .on('error', (error) => reject(error));
    });
}
function hasErrorValues(record) {
    return (
        record.price === 'err-no price' ||
        (record.name === 'err-no name' &&
            record.brand === 'err-no brand')
    );
}
function isDuplicate(existingData, newRecord) {
    return existingData.some(record => (
        record.imgsrc === newRecord.imgsrc &&
        record.brand === newRecord.brand &&
        record.name === newRecord.name &&
        record.price === newRecord.price &&
        record.stars === newRecord.stars &&
        record.totalRatings === newRecord.totalRatings &&
        record.link === newRecord.link &&
        record.boughtInPastMonth === newRecord.boughtInPastMonth
    ));
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function appendUniqueData(filePath, newData) {
    const fileExists = fs.existsSync(filePath);
    let existingData = [];

    if (fileExists) {
        // Read the existing data from the CSV file
        existingData = await readCsv(filePath);
    }

    // Filter out duplicates
    const uniqueData = newData.filter(newRecord => !isDuplicate(existingData, newRecord) && !hasErrorValues(newRecord));

    if (uniqueData.length > 0) {
        // Define the CSV writer with the `append` flag
        const writer = csvWriter({
            path: filePath,
            header: [
                { id: 'imgsrc', title: 'Image Source' },
                { id: 'brand', title: 'Brand' },
                { id: 'name', title: 'Name' },
                { id: 'price', title: 'Price' },
                { id: 'stars', title: 'Stars' },
                { id: 'totalRatings', title: 'Total Ratings' },
                { id: 'link', title: 'Link' },
                { id: 'boughtInPastMonth', title: 'Bought In Past Month' }
            ],
            append: fileExists
        });

        // Write unique data to CSV file
        await writer.writeRecords(uniqueData);
        console.log('Unique data appended successfully to data.csv!');
    } else {
        console.log('err-no new unique data to append.');
    }
}


async function run() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized' // you can also use '--start-fb ullscreen'
        ]
    });
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')
    await page.goto('https://www.amazon.com/s?k=power+bank&crid=FQ6IEOT8IYTC&sprefix=%2Caps%2C551&ref=nb_sb_noss_2', {
        waitUntil: "domcontentloaded",
    });
    await sleep(1000);
    await page.screenshot({ path: 'amazon.png' });
    await scrapProducts(browser, page);

}



async function scrapProducts(browser, page) {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await sleep(2000);
    const VclassName = 'sg-col-20-of-24.s-result-item.s-asin.sg-col-0-of-12.sg-col-16-of-20.sg-col.s-widget-spacing-small.gsx-ies-anchor.sg-col-12-of-16';
    const HclassName = 'a-section a-spacing-base'
    // Wait for the elements to be available on the page
    try {
        await page.waitForSelector(`.${VclassName.split(' ').join('.')}`, { timeout: 2000 });
        await Vscrap(browser, page);
    } catch (error) {
        console.log('not v')
        await page.waitForSelector(`.${HclassName.split(' ').join('.')}`, { timeout: 2000 });
        await Hscrap(browser, page);
    }



    // console.log(elements.length);
}

async function Hscrap(browser, page) {
    const elements = await page.$$('.a-section.a-spacing-base');
    const allProducts = [];

    for (const product of elements) {
        // Extract the text content of the element
        let imgsrc, brand, name, price, stars, totalRatings, link, boughtInPastMonth;
        try {
            imgsrc = await product.$eval('.s-image', element => element.src);
        } catch (error) {
            imgsrc = 'err-no image';
        }
        try {
            name = await product.$eval('div>.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-4', element => element.innerText);
        }
        catch (error) {
            name = 'err-no name';
        }

        try {
            stars = await product.$eval('a>i.a-icon.a-icon-star-small.a-star-small-4-5.aok-align-bottom', element => element.innerText);
        } catch (error) {
            stars = 'err-no stars';
        }

        try {
            price = await product.$eval('span.a-offscreen', element => element.innerText);

        } catch (error) {
            price = 'err-no price';
        }

        try {
            link = await product.$eval('a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal', element => element.href);
        } catch (e) {
            link = 'err-no link';
        }

        try {
            boughtInPastMonth = await product.$eval('div>span.a-size-base.a-color-secondary', element => element.innerText);
        } catch (error) {
            boughtInPastMonth = 'err-no boughtInPastMonth';
        }


        console.log({
            imgsrc,
            brand,
            name,
            price,
            stars,
            totalRatings,
            link,
            boughtInPastMonth
        });
        allProducts.push({
            imgsrc,
            brand,
            name,
            price,
            stars,
            totalRatings,
            link,
            boughtInPastMonth
        });
    }
    try {
        await appendUniqueData('data.csv', allProducts)

    } catch (error) {
        console.error('Error processing CSV file:', error)
    }


    const pagination = await page.$('div.a-section.a-text-center.s-pagination-container');
    console.log(pagination);
    if (pagination && await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator')) {
        try {
            page.$eval('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator', element => element.click());
            page.waitForNavigation();
            await sleep(1000);
            await scrapProducts(browser, page);
        } catch (error) {
            console.log('pagination-block', error);
        }

    }
}

async function Vscrap(browser, page) {
    // Extract all elements with the specified class
    const elements = await page.$$('.sg-col-inner');
    elements.pop();
    elements.pop();
    const allProducts = [];
    for (const product of elements) {
        // Extract the text content of the element
        let imgsrc, brand, name, price, stars, totalRatings, link, boughtInPastMonth;
        try {
            imgsrc = await product.$eval('.s-image', element => element.src);
        } catch (error) {
            imgsrc = 'err-no image';
        }

        try {
            brand = await product.$eval('span.a-size-medium.a-color-base', element => element.innerText);
        } catch (error) {
            brand = 'err-no name';
        }

        try {
            name = await product.$eval('h2>a>span.a-size-medium.a-color-base.a-text-normal', element => element.innerText);
        }
        catch (error) {
            name = 'err-no name';
        }

        try {
            price = await product.$eval('span.a-offscreen', element => element.innerText);
        } catch (error) {
            price = 'err-no price';
        }

        try {
            stars = await product.$eval('span.a-icon-alt', element => element.innerText);
        } catch (error) {
            stars = 'err-no stars';
        }


        try {
            // totalRatings = await product.$eval('div>.s-csa-instrumentation-wrapper.alf-search-csa-instrumentation-wrapper', element => element.innerText);
        } catch (error) {
            console.log(error);
            totalRatings = 'err-no ratings';
        }

        try {
            link = await product.$eval('a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal', element => element.href);
        } catch (e) {
            link = 'err-no link';
        }

        try {
            boughtInPastMonth = await product.$eval('div>span.a-size-base.a-color-secondary', element => element.innerText);
        } catch (error) {
            boughtInPastMonth = 'err-no boughtInPastMonth';
        }

        console.log({
            imgsrc,
            brand,
            name,
            price,
            stars,
            totalRatings,
            link,
            boughtInPastMonth
        });
        allProducts.push({
            imgsrc,
            brand,
            name,
            price,
            stars,
            totalRatings,
            link,
            boughtInPastMonth
        });
        //   console.log(text);
    }


    try {
        await appendUniqueData('data.csv', allProducts)

    } catch (error) {
        console.error('Error processing CSV file:', error)
    }


    const pagination = await page.$('div.a-section.a-text-center.s-pagination-container');
    console.log(pagination);
    if (pagination && await page.$('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator')) {
        try {
            page.$eval('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator', element => element.click());
            page.waitForNavigation();
            await sleep(1000);
            await scrapProducts(browser, page);
        } catch (error) {
            console.log('pagination-block', error);
        }

    }
}



try {
    (async () => {
        await run();
        // console.log('run')
        // console.log(allProducts.length)
        // console.log(allProducts[0])
    })()
} catch (e) {
    console.log(e)
}
