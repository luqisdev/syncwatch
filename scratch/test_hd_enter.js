const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    const input = await page.$('input[type="text"]');
    await input.type('saplanti');
    await page.keyboard.press('Enter');
    
    console.log("Pressed enter, waiting 5 seconds...");
    await new Promise(r => setTimeout(r, 5000));
    console.log("Current URL:", page.url());
    console.log("Title:", await page.title());
    
    // Check if there are movie links
    const movieUrl = await page.$eval('.poster a', el => el.href).catch(() => null);
    console.log("Movie URL from .poster a:", movieUrl);

    await browser.close();
})();
