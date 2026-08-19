const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Ağ isteklerini dinle
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('.m3u8') || url.includes('.mp4')) {
            console.log("BULUNAN STREAM:", url);
        }
    });

    console.log("Siteye gidiliyor...");
    await page.goto('https://hdfilmcehennemi.mobi/video/embed/pxvp89NbhOV/?rapidrame_id=0v4koswo623p', { waitUntil: 'networkidle2' });
    
    // Oynat butonuna bas
    const btn = await page.$('.play-icon, #playerPoster');
    if (btn) {
        console.log("Play butonuna basılıyor...");
        await btn.click();
    }
    
    await new Promise(r => setTimeout(r, 10000));
    await browser.close();
})();
