const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.net/arama/saplanti ...");
    await page.goto('https://www.hdfilmcehennemi.net/arama/saplanti', { waitUntil: 'domcontentloaded' });
    
    console.log("Title:", await page.title());
    const movieUrl = await page.$eval('.poster a', el => el.href).catch(() => null);
    console.log("Movie URL:", movieUrl);

    await browser.close();
})();
