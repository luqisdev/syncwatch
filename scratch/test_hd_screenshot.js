const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log("Navigating...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'networkidle2' });
    
    // Sometimes there is a modal or popup blocking the screen. Click somewhere safe.
    await page.mouse.click(10, 10);
    await new Promise(r => setTimeout(r, 1000));
    
    const input = await page.$('input[type="text"]');
    if (input) {
        console.log("Typing 'saplanti'...");
        await input.click(); // Focus first
        await input.type('saplanti', { delay: 200 });
        
        console.log("Waiting for dropdown...");
        await new Promise(r => setTimeout(r, 6000));
        
        // Take screenshot
        await page.screenshot({ path: 'scratch/screenshot.png' });
        console.log("Screenshot saved to scratch/screenshot.png");
        
        // Dump all links text and hrefs
        const links = await page.$$eval('a', anchors => anchors.map(a => ({ text: a.innerText, href: a.href })));
        const saplantiLinks = links.filter(l => l.text && l.text.toLowerCase().includes('saplant'));
        console.log("Found saplanti links:", saplantiLinks);
    } else {
        console.log("Input not found");
    }

    await browser.close();
})();
