const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'domcontentloaded' });
    
    // Check for any data attributes that might contain a URL, or buttons for servers
    const details = await page.evaluate(() => {
        const servers = Array.from(document.querySelectorAll('.server, .s-button, .keremiya_part a')).map(el => el.outerHTML);
        const iframes = Array.from(document.querySelectorAll('iframe')).map(el => el.outerHTML);
        const videos = Array.from(document.querySelectorAll('video')).map(el => el.outerHTML);
        return { servers, iframes, videos };
    });
    
    console.log(JSON.stringify(details, null, 2));
    await browser.close();
})();
