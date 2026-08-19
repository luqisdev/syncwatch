const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/?s=Saplant%C4%B1', { waitUntil: 'domcontentloaded' });
    console.log("Current URL after search:", page.url());
    await browser.close();
})();
