const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    // Now setup intercept
    page.on('request', request => {
        if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
            console.log("XHR/Fetch request to:", request.url());
        }
    });

    const input = await page.$('input[type="text"]');
    console.log("Typing 'saplanti'...");
    await input.type('saplanti', { delay: 100 });
    
    await new Promise(r => setTimeout(r, 4000));
    
    // Dump search container
    const searchContainer = await page.evaluate(() => {
        const sc = document.querySelector('.search-container, .header-search, form');
        return sc ? sc.outerHTML : 'Not found';
    });
    console.log("Search container:", searchContainer.substring(0, 500));

    await browser.close();
})();
