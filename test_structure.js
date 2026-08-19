const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/?s=Saplant%C4%B1', { waitUntil: 'domcontentloaded' });
    
    // Dump the outerHTML of the movie links
    const htmls = await page.$$eval('a[href*="-izle/"]', anchors => anchors.map(a => a.parentElement.outerHTML).slice(0, 2));
    console.log(JSON.stringify(htmls, null, 2));
    await browser.close();
})();
