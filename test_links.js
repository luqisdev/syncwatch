const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'domcontentloaded' });
    const links = await page.$$eval('a', anchors => anchors.map(a => ({ href: a.href, text: a.innerText })).slice(0, 50));
    console.log(JSON.stringify(links, null, 2));
    await browser.close();
})();
