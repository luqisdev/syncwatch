const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    const searchBtns = await page.$$('.search-btn, .search-button, .fa-search, [class*="search"]');
    if (searchBtns.length > 0) {
        try { await searchBtns[0].click(); } catch(e){}
    }
    await new Promise(r => setTimeout(r, 1000));
    
    const input = await page.$('input[type="text"]');
    if (input) {
        await input.type('saplanti', { delay: 100 });
        console.log("Typed 'saplanti'");
        
        // Find icon and click
        const icon = await page.$('.search-icon, button[type="submit"]');
        if (icon) {
            console.log("Clicking search icon...");
            await icon.click();
            await new Promise(r => setTimeout(r, 3000));
            console.log("URL after clicking icon:", page.url());
            console.log("Title after clicking icon:", await page.title());
        } else {
            console.log("No search icon found");
        }
    }

    await browser.close();
})();
