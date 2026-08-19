const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'networkidle2' });
    
    const iframes = await page.$$eval('iframe', frames => frames.map(f => ({
        src: f.src,
        dataSrc: f.getAttribute('data-src'),
        id: f.id,
        className: f.className
    })));
    
    console.log(JSON.stringify(iframes, null, 2));
    await browser.close();
})();
