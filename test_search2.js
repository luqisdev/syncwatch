const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/?s=Saplant%C4%B1', { waitUntil: 'domcontentloaded' });
    const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
    console.log(JSON.stringify(links, null, 2));
    await browser.close();
})();
