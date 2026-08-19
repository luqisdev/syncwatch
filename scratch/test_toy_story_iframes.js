const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const query = "toy story";
    
    console.log("Navigating...");
    await page.goto('https://www.hdfilmcehennemi.nl/', { waitUntil: 'networkidle2' });
    
    await page.mouse.click(10, 10);
    await new Promise(r => setTimeout(r, 1000));
    
    const input = await page.$('input[type="text"]');
    await input.click();
    await input.type(query, { delay: 100 });
    console.log(`Typed "${query}", waiting 5s...`);
    await new Promise(r => setTimeout(r, 5000));
    
    const links = await page.$$eval('a', anchors => anchors.map(a => ({ text: a.innerText, href: a.href })));
    const normalizedQuery = query.toLowerCase().trim().split(' ')[0];
    const movieLink = links.find(l => l.text && l.text.toLowerCase().includes(normalizedQuery) && l.href && l.href.includes('hdfilmcehennemi'));
    
    console.log("Found link:", movieLink);
    
    if (movieLink) {
        await page.goto(movieLink.href, { waitUntil: 'domcontentloaded' });
        
        let iframes = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('iframe')).map(f => f.src || f.getAttribute('data-src'));
        });
        console.log("All iframes initially:", iframes);
        
        // Wait and click play button
        const playButtonSelector = '.player-poster, #playerPoster, .play-icon, .video-container';
        if (await page.$(playButtonSelector) !== null) {
            console.log("Clicking play button...");
            await page.evaluate((sel) => {
                const btn = document.querySelector(sel);
                if (btn) btn.click();
            }, playButtonSelector);
            await new Promise(r => setTimeout(r, 4000)); 
            
            iframes = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('iframe')).map(f => f.src || f.getAttribute('data-src'));
            });
            console.log("All iframes after click:", iframes);
        }
    }
    
    await browser.close();
})();
