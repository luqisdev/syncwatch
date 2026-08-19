const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' });
    
    // Sometimes the search is hidden behind a button
    const searchBtns = await page.$$('.search-btn, .search-button, .fa-search, [class*="search"]');
    if (searchBtns.length > 0) {
        console.log("Clicking search button...");
        try { await searchBtns[0].click(); } catch(e){}
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    const input = await page.$('input[type="text"]');
    if (input) {
        console.log("Typing 'saplanti'...");
        await input.type('saplanti', { delay: 150 });
        console.log("Waiting 5s for autocomplete...");
        await new Promise(r => setTimeout(r, 5000));
        
        // Dump the whole body HTML into a file to inspect locally
        const html = await page.content();
        require('fs').writeFileSync('scratch/hd_final.html', html);
        console.log("Saved hd_final.html");
    }

    await browser.close();
})();
