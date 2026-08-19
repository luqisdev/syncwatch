const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi...");
    await page.goto('https://www.hdfilmcehennemi.net/arama/saplanti', { waitUntil: 'domcontentloaded' }).catch(e => console.log(e));
    const title = await page.title();
    console.log("Title:", title);
    
    const movieUrl = await page.$eval('.poster a', el => el.href).catch(() => null);
    console.log("Movie URL:", movieUrl);
    
    if (movieUrl) {
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded' });
        const iframe = await page.$eval('iframe', el => el.src).catch(() => null);
        console.log("Iframe:", iframe);
    }
    
    await browser.close();
})();
