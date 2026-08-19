const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to filmizlet...");
    await page.goto('https://www.filmizlet.net/?s=saplanti', { waitUntil: 'domcontentloaded' }).catch(e => console.log(e));
    const title = await page.title();
    console.log("Title:", title);
    await browser.close();
})();
