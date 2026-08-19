const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to filmmodu...");
    await page.goto('https://www.filmmodu16.com/arama/?q=saplant%C4%B1', { waitUntil: 'domcontentloaded' }).catch(e => console.log(e));
    const title = await page.title();
    console.log("Title:", title);
    await browser.close();
})();
