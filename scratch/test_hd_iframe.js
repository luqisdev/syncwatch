const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to movie page...");
    await page.goto('https://www.hdfilmcehennemi.nl/obsession-2026-hdfc-36/', { waitUntil: 'domcontentloaded' });
    
    // Find iframe
    const iframe = await page.$eval('iframe', el => el.src || el.getAttribute('data-src')).catch(() => null);
    console.log("Iframe:", iframe);

    await browser.close();
})();
