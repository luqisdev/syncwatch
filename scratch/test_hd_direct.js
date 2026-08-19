const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to search URL...");
    await page.goto('https://www.hdfilmcehennemi.nl/arama/saplanti', { waitUntil: 'domcontentloaded' }).catch(e => console.log(e));
    
    const title = await page.title();
    console.log("Title:", title);

    const movieUrl = await page.$eval('.poster a', el => el.href).catch(() => null);
    console.log("Movie URL from .poster a:", movieUrl);
    
    await browser.close();
})();
