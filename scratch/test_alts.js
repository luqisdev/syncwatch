const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testSource(name, searchUrl, searchInputSelector, resultSelector, iframeContainer) {
    console.log(`\n--- Testing ${name} ---`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        let movieUrl;
        
        if (searchInputSelector) {
            await page.type(searchInputSelector, 'toy story');
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
            movieUrl = await page.$eval(resultSelector, el => el.href);
        } else {
            movieUrl = await page.$eval(resultSelector, el => el.href);
        }
        
        console.log(`Found movie: ${movieUrl}`);
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        // click play if needed
        if (iframeContainer) {
             const btn = await page.$(iframeContainer);
             if(btn) await btn.click();
             await new Promise(r => setTimeout(r, 4000));
        }

        const iframeSrc = await page.evaluate(() => {
            const iframes = Array.from(document.querySelectorAll('iframe'));
            for (let f of iframes) {
                let s = f.src || f.getAttribute('data-src');
                if (s && !s.includes('youtube')) return s;
            }
            return null;
        });
        
        console.log(`Iframe found: ${iframeSrc}`);
        
    } catch (e) {
        console.log(`Failed: ${e.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

(async () => {
    // Test filmmodu
    await testSource('Filmmodu', 'https://www.filmmodu16.com/?s=toy+story', null, '.movie a', '.play-btn');
    // Test fullhdfilmizlesene
    await testSource('FullHDFilmİzlesene', 'https://www.fullhdfilmizlesene.pw/arama/toy+story', null, '.movie-poster a', '.play-btn');
})();
