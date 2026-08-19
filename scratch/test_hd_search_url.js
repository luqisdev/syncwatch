const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to /search/saplanti...");
    await page.goto('https://www.hdfilmcehennemi.nl/search/saplanti', { waitUntil: 'domcontentloaded' });
    console.log("Title:", await page.title());
    await browser.close();
})();
