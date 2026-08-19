const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to series page...");
    await page.goto('https://www.hdfilmcehennemi.nl/dizi/sex-education-izle-7/', { waitUntil: 'domcontentloaded' });
    
    // Find all links that look like an episode link
    const episodeLinks = await page.$$eval('a', anchors => {
        return anchors
            .map(a => ({ text: a.innerText.trim(), href: a.href }))
            .filter(a => a.href.includes('sezon') || a.href.includes('bolum'));
    });
    console.log("Episode links found:", episodeLinks.slice(0, 5));
    
    await browser.close();
})();
