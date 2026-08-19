const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    const searchHtml = await page.evaluate(() => {
        const input = document.querySelector('input[type="text"], input[name="search"]');
        return input ? input.outerHTML : 'Not found';
    });
    console.log("Input HTML:", searchHtml);
    
    await browser.close();
})();
