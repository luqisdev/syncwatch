const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'domcontentloaded' });
    
    const playButtonSelector = '.player-poster, #playerPoster';
    if (await page.$(playButtonSelector) !== null) {
        console.log('Clicking play poster...');
        // Puppeteer click sometimes gets intercepted by absolute divs. evaluate click is safer
        await page.evaluate((sel) => {
            document.querySelector(sel).click();
        }, playButtonSelector);
        
        await new Promise(r => setTimeout(r, 3000));
    }
    
    const iframes = await page.$$eval('iframe', frames => frames.map(f => ({
        src: f.src,
        dataSrc: f.getAttribute('data-src'),
        id: f.id,
        className: f.className,
        parentClass: f.parentElement ? f.parentElement.className : ''
    })));
    
    console.log(JSON.stringify(iframes, null, 2));
    await browser.close();
})();
