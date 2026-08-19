const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const query = 'toy story';
    
    console.log("Navigating to filmmakinesi.com...");
    await page.goto(`https://filmmakinesi.com/?s=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(e.message));
    
    const movieUrl = await page.$eval('.post-title a, .movie a', el => el.href).catch(()=>null);
    console.log(`Found movie: ${movieUrl}`);
    
    if (movieUrl) {
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        let iframes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('iframe')).map(f => f.src || f.getAttribute('data-src'));
        });
        console.log("Iframes found:", iframes);
    }
    await browser.close();
})();
