
const puppeteer = require('puppeteer');
const { getCondition } = require('../utils/common');


// Doesn't need this as every Chromium instance works same like ignito mode or private mode so needs to LOG IN each time with each instance. 
async function getAuthFacebook() {
  const url = 'https://www.facebook.com';
  try {
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
    });
    await page.goto(url);

    const isLoggedIn = await page.evaluate(() => {
      const findFriendsLink = document.querySelector('a[aria-label="Friends"]');
      return findFriendsLink
    });
    await browser.close();
    return isLoggedIn;
  } catch (error) {
    console.log(error);
  }
}

async function loginFacebook(user, { email, pass }) {
  let scrapeFacebook;
  const url = 'https://www.facebook.com/';
  try {
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
    });
    await page.goto(url);
    console.log('page opened for facebook login');
    await page.screenshot({ path: 'screenshot.png', fullPage: true });

    let credentials = {
      EMAIL: email,
      PASSWORD: pass
    }


    await page.waitForSelector('#email');
    await page.type('#email', credentials.EMAIL);
    await new Promise(r => setTimeout(r, 1000));
    console.log('email entered');
    await page.type('#pass', credentials.PASSWORD);
    await new Promise(r => setTimeout(r, 1000));
    console.log('password entered');
    await page.screenshot({ path: 'emailpass.png', fullPage: true });

    // await Promise.all([
    //   page.click('button[name="login"]'),
    //   page.waitForNavigation()
    // ]);
    await new Promise(r => setTimeout(r, 3000));

    await page.click('button[name="login"]')
    console.log('login clicked')
    await new Promise(r => setTimeout(r, 3000));
    console.log('waiting for navigation')
    // await page.screenshot({ path: 'navgationstarted.png', fullPage: true });

    await page.waitForNavigation({timeout: 60000});

    // await page.screenshot({ path: 'homepage.png', fullPage: true });

    const currentUrl = page.url();
    console.log(currentUrl,'sssss')
    if (currentUrl === "https://www.facebook.com/?sk=welcome" || currentUrl === "https://www.facebook.com/" || currentUrl === "https://web.facebook.com/?sk=welcome") {
      scrapeFacebook = await scrapeMarketPlaceData(browser, user)
    }
    await browser.close();
    return scrapeFacebook;
  } catch (error) {
    console.log(error);
  }
}

async function scrapeMarketPlaceData(browserInstance, user) {
  try {
    console.log("marketplace")
    //  let interest = user?.interests[0]
    let userIntrests = user?.interests?.map(us => {
      if (us.platform === 'Facebook') return us
    });
    let interest = userIntrests[0]
    let condition = await getCondition(interest.condition?.toLowerCase(), "facebook")
    console.log(interest, "condition")
    let facebookDataArr = [];
    const marketPage = await browserInstance.newPage();

    await marketPage.goto(`https://www.facebook.com/marketplace/111922808834701/search?minPrice=${interest?.min_price}&maxPrice=${interest?.max_price}&sortBy=best_match&itemCondition=${condition}&query=${interest?.keywords}`);

    let radiusSelector = await marketPage.waitForSelector('#seo_filters > div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x78zum5.x1a2a7pz.x1xmf6yo');
    if (radiusSelector) {
      await marketPage.evaluate(async () => {
        document.querySelector('#seo_filters > div.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x78zum5.x1a2a7pz.x1xmf6yo').click()
      });
    }
    let raduisDropDown = await marketPage.waitForSelector('[aria-haspopup="listbox"][aria-label="Radius"]')
    if (raduisDropDown) {
      // let list = marketPage.waitForSelector('[aria-haspopup="listbox"][aria-label="Radius"]')
      await marketPage.evaluate(async () => {
        document.querySelector('[aria-haspopup="listbox"][aria-label="Radius"]').click();
      })
    }
    let drop = await marketPage.waitForSelector('div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.x1i6fsjq.xfvfia3.xnqzcj9.x1gh759c.x10wwi4t.x1x7e7qh.x1344otq.x1de53dj.x1n2onr6.x16tdsg8.x1ja2u2z')
    // await marketPage.waitForTimeout(2000)
    if (drop) {
      await marketPage.evaluate(async (interest) => {
        const arr = Array.from(document.querySelectorAll('div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.x1i6fsjq.xfvfia3.xnqzcj9.x1gh759c.x10wwi4t.x1x7e7qh.x1344otq.x1de53dj.x1n2onr6.x16tdsg8.x1ja2u2z'));
        const value = Number(interest.radius);
        console.log(value, "radius")
        let selectedValue;
        if (value === 1) {
          selectedValue = 0;
        } else if (value === 2) {
          selectedValue = 1;
        } else if (value === 5) {
          selectedValue = 2;
        } else if (value === 10) {
          selectedValue = 3;
        } else if (value === 20) {
          selectedValue = 4;
        } else if (value === 40) {
          selectedValue = 5;
        } else if (value === 60) {
          selectedValue = 6;
        } else if (value === 80) {
          selectedValue = 7;
        } else if (value === 100) {
          selectedValue = 8;
        } else if (value === 250) {
          selectedValue = 9;
        } else if (value === 500) {
          selectedValue = 10;
        } else {
          // Handle invalid value
          selectedValue = null;
        }
        arr[Number(selectedValue)].click();
      }, interest)
    }

    //Location Input
    let input = await marketPage.waitForSelector('input[aria-label="Location"]');
    let inputValue = `${interest?.city} ${interest?.state}`;
    await input.type(inputValue);
    await marketPage.waitForSelector('div.xu96u03.xm80bdy.x10l6tqk.x13vifvy > div', { visible: true });
    
    // Replace waitForTimeout with setTimeout for older Puppeteer versions
     await new Promise(resolve => setTimeout(resolve, 2000));

    // Click on the first suggestion in the dropdown list
    await marketPage.click('div.xu96u03.xm80bdy.x10l6tqk.x13vifvy > div.x1jx94hy.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.xbsqzb3.x9f619.x78zum5.xdt5ytf.x1iyjqo2.xr9ek0c.xh8yej3 > div > ul > li');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use marketPage.evaluate for clicking "Apply"
    await marketPage.evaluate(() => {
      document.querySelector('[aria-label="Apply"]')?.click();
    });

    await new Promise(resolve => setTimeout(resolve, 4000));

    const marketResults = await marketPage.$$('div.x3ct3a4');
    for (const result of marketResults) {
      let price, title, link, imgSrc;
      link = await result.$eval(':first-child', element => element.href);
      const innerDiv = await result.$$('div.x78zum5.xdt5ytf.x1n2onr6');
      for (const innerResult of innerDiv) {
        const mainCard = await innerResult.$('div.x1n2onr6 > div.x1n2onr6.xh8yej3 div:last-child');
        const titleDescriptionDiv = await innerResult.$(':nth-child(2)');
        const priceDiv = await titleDescriptionDiv.$('div:first-child');
        const titleDiv = await titleDescriptionDiv.$('div:nth-child(2)');
        title = await titleDiv.$eval('span:last-child', element => element?.textContent);
        let checkPriceSpan = await priceDiv.$('span:nth-last-child(2)');
        price;
        if (checkPriceSpan) {
          price = await priceDiv.$eval('span:nth-last-child(2)', element => element?.textContent);
        } else {
          price = await priceDiv.$eval('span:last-child', element => element?.textContent);
        }
        if (mainCard) {
          imgSrc = await mainCard.$eval('img', element => element.src);
        }
      }
      facebookDataArr.push({
        title,
        link,
        price,
        imgSrc
      })
    }
    return facebookDataArr;

  } catch (error) {
    console.log(error);
  }
}


async function getFbListing(user) {
  const isLoggedIn = await getAuthFacebook();
  console.log(isLoggedIn, "isLoggedIn")
  let newFacebookData;
  if (isLoggedIn===undefined||isLoggedIn===null) {
    newFacebookData = await loginFacebook(user, { email: "ibtehaj.mughal@yahoo.com", pass: "Uk@6473235" });
  }
  return newFacebookData;
}

module.exports = { getFbListing }