const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'domcontentloaded' });
    
    const tabs = await page.evaluate(() => {
        // Find elements that might be server tabs
        const possibleTabs = Array.from(document.querySelectorAll('a, button, li, div'))
            .filter(el => {
                const text = el.innerText ? el.innerText.trim().toLowerCase() : '';
                return text.includes('vidmoly') || text.includes('ok.ru') || text.includes('odno') || text.includes('kaynak') || text.includes('server') || text.includes('alternatif');
            })
            .map(el => ({ tag: el.tagName, class: el.className, text: el.innerText, href: el.href || '' }));
        return possibleTabs;
    });
    
    console.log(JSON.stringify(tabs, null, 2));
    await browser.close();
})();
