const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const query = "Sex education";
    
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
        const iframes = await page.$$eval('iframe', frames => frames.map(f => f.src || f.getAttribute('data-src')));
        console.log("Iframes on page:", iframes);
    }
    
    await browser.close();
})();
