const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    // Dump HTML of the header/search area
    const html = await page.$eval('header', el => el.outerHTML).catch(() => 'no header');
    console.log(html.substring(0, 1000));
    
    // Check form action
    const formHtml = await page.$eval('form', el => el.outerHTML).catch(() => 'no form');
    console.log(formHtml);

    await browser.close();
})();
