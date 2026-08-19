const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const query = "toy story";
    
    console.log("Navigating to hdfilmcehennemi.nl...");
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
        console.log("Navigated. Title:", await page.title());
        
        let iframeSrc = await page.evaluate(() => {
            const iframes = Array.from(document.querySelectorAll('iframe'));
            for (let f of iframes) {
                let s = f.src || f.getAttribute('data-src') || '';
                if (s && s !== 'about:blank' && !s.includes('youtube.com') && !s.includes('youtu.be')) {
                    return s;
                }
            }
            return null;
        });

        if (!iframeSrc) {
            const playButtonSelector = '.player-poster, #playerPoster, .play-icon, .video-container';
            if (await page.$(playButtonSelector) !== null) {
                console.log("Clicking play button...");
                await page.evaluate((sel) => {
                    const btn = document.querySelector(sel);
                    if (btn) btn.click();
                }, playButtonSelector);
                await new Promise(r => setTimeout(r, 4000)); 
                
                iframeSrc = await page.evaluate(() => {
                    const iframes = Array.from(document.querySelectorAll('iframe'));
                    for (let f of iframes) {
                        let s = f.src || f.getAttribute('data-src') || '';
                        if (s && s !== 'about:blank' && !s.includes('youtube.com') && !s.includes('youtu.be')) return s;
                    }
                    return null;
                });
            }
        }
        
        console.log("Iframe Src:", iframeSrc);
    }
    
    await browser.close();
})();
