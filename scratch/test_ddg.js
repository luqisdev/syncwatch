const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Searching DuckDuckGo...");
    await page.goto('https://html.duckduckgo.com/html/?q=site:hdfilmcehennemi.nl+saplanti', { waitUntil: 'domcontentloaded' });
    
    const movieUrl = await page.$eval('.result__url', el => el.innerText).catch(() => null);
    console.log("Movie URL from DuckDuckGo:", movieUrl);

    await browser.close();
})();
