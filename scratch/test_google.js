const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Searching on Google...");
    await page.goto('https://www.google.com/search?q=site:hdfilmcehennemi.nl+saplanti+izle', { waitUntil: 'domcontentloaded' });
    
    // Accept cookies if present
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const accept = btns.find(b => b.innerText.includes('Tümünü kabul et') || b.innerText.includes('Accept all'));
        if (accept) accept.click();
    }).catch(() => {});
    
    await new Promise(r => setTimeout(r, 1000));
    
    const movieUrl = await page.$eval('#search a', el => el.href).catch(() => null);
    console.log("Movie URL from Google:", movieUrl);

    if (movieUrl && movieUrl.includes('hdfilmcehennemi.nl')) {
        console.log("Navigating to movie URL...");
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded' });
        const iframe = await page.$eval('iframe', el => el.src).catch(() => null);
        console.log("Iframe:", iframe);
    }

    await browser.close();
})();
