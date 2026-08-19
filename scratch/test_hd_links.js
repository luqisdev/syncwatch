const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    const input = await page.$('input[type="text"]');
    await input.type('saplanti', { delay: 100 });
    
    console.log("Typed saplanti, waiting 3 seconds for ajax...");
    await new Promise(r => setTimeout(r, 3000));
    
    const links = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(href => href && href.includes('saplanti')));
    console.log("Found links with 'saplanti':", links);

    await browser.close();
})();
