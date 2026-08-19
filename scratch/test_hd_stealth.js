const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    console.log("Navigating to hdfilmcehennemi.nl...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'domcontentloaded' }).catch(e => console.log(e));
    
    const title = await page.title();
    console.log("Title:", title);

    if (title.includes('Just a moment')) {
        console.log("Cloudflare stealth bypass FAILED!");
    } else {
        console.log("Cloudflare stealth bypass SUCCESS!");
        
        // Find search input
        const searchInputSelector = 'input[name="search"], input[type="text"], .search-input';
        await page.waitForSelector(searchInputSelector, { timeout: 5000 }).catch(() => console.log("Search input not found"));
        
        await page.type(searchInputSelector, 'saplantı');
        console.log("Typed 'saplantı' into search box, waiting for dropdown...");
        
        // Wait for ajax response
        await new Promise(r => setTimeout(r, 3000));
        
        // Find dropdown items
        const dropdownHtml = await page.evaluate(() => {
            const dropdowns = Array.from(document.querySelectorAll('.search-result, .autocomplete, .results, ul, .dropdown-menu'));
            return dropdowns.map(el => el.outerHTML);
        });
        console.log("Dropdowns found:", dropdownHtml.length);
        if (dropdownHtml.length > 0) {
            console.log(dropdownHtml[0].substring(0, 500));
        }
    }

    await browser.close();
})();
