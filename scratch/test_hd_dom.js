const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    const input = await page.$('input[name="search"]');
    if (input) {
        await input.type('saplanti', { delay: 100 });
        console.log("Typed 'saplanti', waiting 4s...");
        await new Promise(r => setTimeout(r, 4000));
        
        // Find the autocomplete div
        const html = await page.evaluate(() => document.body.innerHTML);
        fs.writeFileSync('scratch/hd_dom.html', html);
        console.log("Saved DOM to scratch/hd_dom.html");
    } else {
        console.log("Input not found");
    }

    await browser.close();
})();
