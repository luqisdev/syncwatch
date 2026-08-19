const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const query = 'toy story';
    
    console.log("Navigating to fullhdfilmizle.mom...");
    await page.goto(`https://www.fullhdfilmizle.mom/?s=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const movieUrl = await page.$eval('.film-ismi a, .poster a', el => el.href).catch(()=>null);
    console.log(`Found movie: ${movieUrl}`);
    
    if (movieUrl) {
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // click the first server button
        const serverBtn = await page.$('.videoparts a, .keremiya_part a');
        if (serverBtn) {
            console.log("Clicking server tab...");
            await serverBtn.click();
            await new Promise(r => setTimeout(r, 4000));
        }
        
        let iframes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('iframe')).map(f => f.src || f.getAttribute('data-src'));
        });
        console.log("Iframes found:", iframes);
        
        // is it blocked by cloudflare? let's check one iframe
        let targetIframe = iframes.find(s => s && !s.includes('youtube') && s !== 'about:blank');
        console.log("Target iframe:", targetIframe);
    }
    await browser.close();
})();
