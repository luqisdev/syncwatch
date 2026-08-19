const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Intercept requests to find search API
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('search')) {
            console.log("Search request to:", request.url());
        }
        request.continue();
    });

    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    // Type into all input[type="text"] to see which one triggers search
    const inputs = await page.$$('input[type="text"]');
    console.log("Found text inputs:", inputs.length);
    for (let i = 0; i < inputs.length; i++) {
        try {
            await inputs[i].type('saplantı');
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {}
    }
    
    await browser.close();
})();
